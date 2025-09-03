---
layout: post.njk
title: "Still Talking About Design Patterns?"
description: "Discussion about Design Patters in Software Development."
date: 2025-09-03
tags:
  - "Software Architecture"
  - "Design Patterns"
  - "System Design"
  - "Software Development"
---

Yes, I know. This has all been said before. And yet, here I am saying it again.
Do I apologize? Not really. If you already know where this is going, feel free
to scroll on: this isn’t the slightly bitter old dev you’re looking for. But if
you came here expecting me to praise design patterns, or worse, if the mere
thought of someone criticizing them makes you think I must be insane,
incompetent, or both, then congratulations: this article is for you. And only
for you, my friend.

First, let’s be clear. There’s nothing inherently wrong with design patterns.
Quite the opposite. The problem is that our approach to them can feel more
like ritual than resource. I got the itch to write this piece after seeing
someone’s *Design Pattern Cheat Sheet* (I think it was on Substack). It was
a well-organized but overloaded, letter-sized diagram of around thirty
patterns. Each one was neatly explained, and the presentation was perfectly
clear. In other words, a really good cheat sheet. However, if you ask me, it
was also proof of a misunderstanding.

**The Origins of the Pattern Hype**

Thirty years ago, languages of the time lacked many of the features we
now take for granted: events, lambdas, dependency injection frameworks, even
basic generics. Developers needed structure and common ground, and the “Gang
of Four” stepped in to fill the void.

This was, and still is, very useful. Patterns is a community-driven way to
extend the language and build a common culture. They provide us with a shared
vocabulary - instead of explaining an entire architecture, you could just say
*Observer* and hope your colleague know what you mean. They also provide
scaffolding by offering a map of typical solutions, helping developers avoid
reinventing the wheel. 

Some patterns have since become obsolete, because modern languages already
bake in the functionality that patterns once had to fake. Like, *Observer* is
just events, and someone told me *"Strategy is just passing a function"*. I
have never heard of this *Strategy* pattern, but I understand what *"passing a
function"* means.

**What Actually Matters**

Patterns are useful when treated as helpful guides and not as a checklists.
Given you know the lingo, they help us communicate, but does not guarantee
good design.

Good design is contextual and depends on:

* The language you’re using.
* The domain you’re solving problems for.
* The readability and maintainability of the code five years from now.

The moment we forget this, patterns turn into rituals we repeat without
understanding, and potentially adds unnecessary complexity. Do you really
need the *Decorator* pattern just to add milk to a cup of coffee? Probably
not.

But now I hear you thinking: *“Yeah, but nobody builds a coffee-only ordering
system.”* And you’re absolutely right. The problem is that, in my experience,
systems often get built in needlessly complex ways, designed to handle
scenarios that will never actually happen in real life.

**Conclusion/Opinion**

You don’t need to memorize thirty design patterns. You don't even need to
memorize half of them - knowing what *Strategy* is doesn't make you a better
developer (but it probably doesn't hurt either).  
  
If you solve real problems well, the patterns emerge on their own. Mastery
isn’t about catalogs, it’s about understanding context and finding the simplest
solution that fits it. Use a pattern or three if you like, but only if it makes
the code clearer and easier to maintain.