---
layout: post.njk
title: "Asynchronous Synchronous Dynamics 365 Plugins"
description: "An article about achieving asynchronous behavior in synchronous Dataverse plugins using Azure Functions."
date: 2025-08-08
tags:
  - Dataverse
  - Plugins
  - Azure Functions
  - C#
  - Asynchronous
  - Synchronous
---

When developing plugins that interact with external APIs, you quickly run into a major limitation: 𝘁𝗵𝗲 𝗗𝗮𝘁𝗮𝘃𝗲𝗿𝘀𝗲 𝗽𝗹𝘂𝗴𝗶𝗻 𝘀𝗮𝗻𝗱𝗯𝗼𝘅 𝗱𝗼𝗲𝘀 𝗻𝗼𝘁 𝗿𝗲𝗹𝗶𝗮𝗯𝗹𝘆 𝘀𝘂𝗽𝗽𝗼𝗿𝘁 𝗮𝘀𝘆𝗻𝗰𝗵𝗿𝗼𝗻𝗼𝘂𝘀 𝗲𝘅𝗲𝗰𝘂𝘁𝗶𝗼𝗻. While it's technically possible to use async/await or Task.Run, doing so within the sandbox is risky and unsupported. These approaches may appear to work in development or isolated cases, but they often result in unpredictable behavior, such as deadlocks, thread aborts, or context corruption. Especially under load.

Because all plugin code must be 𝘀𝘆𝗻𝗰𝗵𝗿𝗼𝗻𝗼𝘂𝘀 and complete within its execution time limits, scenarios that would benefit from parallelism — like making multiple HTTP calls simultaneously — become difficult or unsafe to implement directly in the plugin.

Full source code for this article can be found here:

https://github.com/danielsolin/articles/tree/main/DS.Articles.AsyncSyncPlugin

**Solution: Async Work Via Azure Functions**

To work around this limitation, we can use an Azure Function to handle the parallelism. This function handles concurrent tasks (like multiple API calls), while the plugin remains completely synchronous. The plugin sends a payload to the function, blocks synchronously for the result, and then continues with normal logic.

An Azure Function is used in this example, but it could be anything that supports asynchronous operations and can be called synchronously from the plugin.

**Plugin Code (SyncPlugin.cs)**

The plugin gathers a list of URLs, serializes them to JSON, sends them to the Azure Function, and synchronously waits for the combined result.

```csharp
public void Execute(IServiceProvider serviceProvider)
{
    // Define the URLs to be processed by the Azure Function
    var urls = new[]
    {
        "https://example.com/api/getdata1",
        "https://example.com/api/getdata2",
        "https://example.com/api/getdata3"
    };

    // Prepare the payload to send to the Azure Function
    var payload = new
    {
        urls
    };

    var json = JsonConvert.SerializeObject(payload);
    var content = new StringContent(
        json, Encoding.UTF8, "application/json");

    using (var client = new HttpClient())
    {
        client.DefaultRequestHeaders.UserAgent
            .ParseAdd("DS-Agent/1.0");

        try
        {
            // Send the payload to the Azure Function
            var response = client.PostAsync(
                "http://localhost:1234/AsyncFunction", content)
                .GetAwaiter().GetResult();

            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidPluginExecutionException(
                    $"Function call failed with status code: " +
                    $"{response.StatusCode}"
                );
            }

            // Read and parse the response from the Azure Function
            var resultJson = response.Content
                .ReadAsStringAsync().GetAwaiter().GetResult();

            var resultObj = JsonConvert.DeserializeObject<
                Dictionary<string, object>>(resultJson);

            if (resultObj.TryGetValue("results", out var rawResults) &&
                rawResults is JArray jResults)
            {
                var results = jResults.Select(x => x.ToString())
                    .ToArray();

                // Log or process the results as needed
                foreach (var result in results)
                {
                    // Example: Log each result (replace with actual logic)
                    Console.WriteLine(result);
                }
            }
        }
        catch (Exception ex)
        {
            throw new InvalidPluginExecutionException(
                $"An error occurred: {ex.Message}", ex);
        }
    }
}
```

**Azure Function Code (AsyncFunction.cs)**

This function receives a list of URLs, makes concurrent HTTP requests to them, and returns the combined results as JSON.

```csharp
[Function("AsyncFunction")]
public async Task<IActionResult> Run(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")]
    HttpRequest req)
{
    _logger.LogInformation("Processing request in AsyncFunction.");

    string body;
    try
    {
        body = await new StreamReader(req.Body).ReadToEndAsync();
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to read request body.");
        return new BadRequestObjectResult("Invalid request body.");
    }

    JObject parsed;
    try
    {
        parsed = JObject.Parse(body);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to parse JSON.");
        return new BadRequestObjectResult("Invalid JSON format.");
    }

    var urls = parsed["urls"]?.ToObject<string[]>() ?? Array.Empty<string>();

    if (!urls.Any()){
        _logger.LogWarning("No URLs provided in the request.");
        return new BadRequestObjectResult("No URLs provided.");
    }

    var tasks = urls.Select(async url =>
    {
        try
        {
            _logger.LogInformation($"Fetching data from URL: {url}");
            _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("DS-Agent/1.0");
            return await _httpClient.GetStringAsync(url);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to fetch data from URL: {url}");
            return $"Error fetching data from {url}: {ex.Message}";
        }
    });

    string[] results;
    try
    {
        results = await Task.WhenAll(tasks);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error during parallel execution of HTTP requests.");
        return new StatusCodeResult(StatusCodes.Status500InternalServerError);
    }

    var response = new
    {
        results
    };

    _logger.LogInformation("Successfully processed all URLs.");
    return new OkObjectResult(response);
}
```

**Example Input**

```json
{
  "urls": [
    "https://example.com/api/getdata1",
    "https://example.com/api/getdata2",
    "https://example.com/api/getdata3"
  ]
}
```

**Example Output**

```json
{
  "results": [
    "{...data from getdata1...}",
    "{...data from getdata2...}",
    "{...data from getdata3...}"
  ]
}
```

**Summary**

Yes — it’s possible to get asynchronous behavior inside a synchronous Dataverse plugin. You just need to offload the parallel work to something that’s allowed to perform threading and asynchronous operations. In this case, that something is an Azure Function (but again - it could be something else), which can run the workload in parallel and return the result synchronously to the plugin.