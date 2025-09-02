---
layout: post.njk
title: "Why Task.Run() Has No Place in Dataverse Plugins"
description: "An article about why Task.Run() should not be used in Dataverse plugins."
date: 2025-08-02
tags:
  - Dataverse
  - Plugins
  - "Task.Run"
  - "C#"
---

Dataverse plugins are isolated pieces of .NET code that run on the server when certain events happen. Like creating, updating, or deleting a record. You can register a plugin to run synchronously (runs immediately and blocks the request) or asynchronously (queued to run later).

Sometimes developers try to get the best of both worlds by keeping a step synchronous, but inside it use Task.Run() to offload something “in the background.” It looks harmless, but unfortunately isn’t.

**What Task.Run() Does**

Task.Run() pushes work to the .NET thread pool. In a normal application it makes perfect sense, but in Dataverse Plugin, the environment is not designed for it.

**Why It's a Problem**

* **Sandbox teardown** – Plugins run in an isolated sandbox process. Once your Execute method returns, the platform may unload the AppDomain or kill the sandbox. Any Task.Run() code still running will simply vanish.
* **Breaks the execution contract** – Synchronous steps are meant to finish all work before returning. Background tasks break that assumption and create race conditions.
* **No transaction scope** – In synchronous plugins, you’re usually inside a database transaction. Background tasks run outside it. If the main transaction fails, your background work is still committed — or vice versa.
* **Unsupported service calls** – Services like IOrganizationService are tied to the plugin’s execution context. Calling them from another thread is unsupported and may fail in unpredictable ways.
* **Debugging headaches** – Failures can be silent, and logs won’t match the order of execution you expect.

**A Quick Example**

```csharp
public void Execute(IServiceProvider serviceProvider)
{
    var context = (IPluginExecutionContext)serviceProvider
      .GetService(typeof(IPluginExecutionContext));
    var factory = (IOrganizationServiceFactory)serviceProvider
      .GetService(typeof(IOrganizationServiceFactory));
    var service = factory.CreateOrganizationService(
      context.UserId
    );

    // Unsafe: background thread in plugin
    Task.Run(() =>
    {
        var email = new Entity("email");
        // set fields...
        service.Create(email); // May fail silently or never run
    });
}
```

It might work in development. It might even work in production. Until one day it doesn’t, and you have no logs explaining why.

**Supported Alternatives**

* **Asynchronous plugin step** – Register the step as async in the Plugin Registration Tool. Dataverse queues it and runs it reliably.
* **Webhook → Azure Function / queue** – Offload the work to an external service. That external service, in turn, can run multiple threads in parallel for improved performance.
* **Power Automate** – For user-level automation or integrations, a Dataverse-triggered flow is the modern replacement for classic workflows.

**Conclusion**

If you need background work, use a supported mechanism. Task.Run() in a plugin is like running a side job in a house you don’t own - someone can walk in and switch off the lights at any moment.
