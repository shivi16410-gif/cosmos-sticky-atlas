# Cosmos Sticky Atlas

Build COSMOS, a modern, interactive infinite-canvas web app for organizing thoughts, plans, goals, lists, photos, ideas, and personal visions.

1. Design and Theme

Create a clean, premium, minimal interface inspired by a physical whiteboard and modern productivity tools.

Default theme — Light Mode:

Use a clean white or soft off-white canvas background, like a real whiteboard.

Add a very subtle light-grey dotted grid to help users organize items spatially.

Use soft pastel sticky notes: yellow, lavender, pale blue, mint green, and light pink.

Use dark, readable text with subtle borders and shadows.

Keep the interface airy, elegant, and distraction-free.

Use restrained purple and blue accents for buttons and active states.

Separate Dark Mode:

Add a clearly visible theme toggle in the top navigation bar, using a sun/moon icon.

Light mode must be the default when a user opens COSMOS for the first time.

Dark mode should have a deep midnight or charcoal canvas with a subtle darker grid.

Adapt text, panels, borders, menus, and controls for readability in dark mode.

Keep sticky notes in soft, readable colors in both themes.

Save the user's selected theme so it persists after refreshing or reopening the app.

Switching themes must not change the positions, sizes, colors, or contents of canvas items.

2. Infinite Canvas

Create a large, pannable and zoomable canvas.

Support dragging items anywhere on the canvas.

Allow users to zoom in and out using mouse controls.

Provide a small minimap or canvas navigation control if practical.

Keep the canvas as the main focus of the application.

3. Sticky Notes and Items

Users should be able to:

Create a new sticky note with a single click.

Edit text directly inside a note.

Drag, resize, recolor, and delete notes.

Choose from multiple pastel note colors.

Select handwriting-style fonts as well as standard readable fonts.

Create different item types: Simple Note, Idea, Goal, and Checklist.

Add checkboxes to checklist notes and mark tasks as complete.

4. User Interface

Add a top navigation bar with the COSMOS logo, theme toggle, undo, redo, and save status.

Add a compact toolbar for creating notes, checklists, goals, and ideas.

Include a clean, unobtrusive settings menu.

Use smooth, subtle animations without making the app feel slow.

Ensure buttons, menus, and controls actually work.

5. Saving and Reliability

Automatically save changes locally using an appropriate browser storage solution.

Restore the canvas, notes, positions, sizes, and selected theme after a page refresh.

Implement undo and redo for common canvas actions.

Avoid losing existing data when switching themes.

Display a subtle “Saved” or “Saving…” status.

6. Technical Requirements

Build this as a web application using React, Vite, JavaScript, and CSS.

Use reusable components and clean, understandable code.

Make the layout responsive for desktop and tablet screens.

Use a suitable canvas interaction library if needed.

Keep the initial version focused on a reliable working canvas rather than adding too many features at once.

7. Future-Ready Structure

Keep the architecture flexible enough to add calendar planning, image uploads, vision boards, search, cloud sync, collaboration, and AI-powered organization in later versions.

Important: Prioritize a functional, polished MVP. Do not create static mockups of controls that do nothing. Test note creation, editing, dragging, resizing, deletion, theme switching, autosave, and restoration after refresh.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bf636b2e-069c-5a41-a998-4c267e31c1a0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
