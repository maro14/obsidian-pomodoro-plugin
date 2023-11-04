# Obsidian Pomodoro Timer Plugin

This is a Pomodoro Timer plugin for Obsidian (<https://obsidian.md>).

This project uses Typescript to provide type checking and documentation.
The repo depends on the latest plugin API (obsidian.d.ts) in Typescript Definition format, which contains TSDoc comments describing what it does.

**Note:** The Obsidian API is still in early alpha and is subject to change at any time!

This Pomodoro Timer plugin helps manage your time by breaking it down into periods of work and rest. It provides the following functionality:

- Adds a ribbon icon, which starts a Pomodoro timer when clicked.
- Shows a notice when the Pomodoro or break ends.
- Adds a plugin setting tab to the settings page, allowing you to customize the lengths of the Pomodoro and breaks.

## First time developing plugins?

Quick starting guide for new plugin devs:

- Check if [someone already developed a plugin for what you want](https://obsidian.md/plugins)! There might be an existing plugin similar enough that you can partner up with.
- Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it).
