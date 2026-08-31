# Spec: location based note taking

## initial idea

I'm going to travel, and to prepare i've been taking notes I however have loads of them now and it isn't practical to just have them in a list.
Rather it would make more sense to have them in a hierarchy based on location. 
So Japan --> Kanto/Tokyo --> Ginza | Akihabara | Shinjuku
and further we could go:

Tokyo --> asakusa --> senoji | kappabashi | kagetsudou Melon Pan store | Don Quijote Asakusa

Now we could have a map Which shows to level notes on it as pins e.g. Japan,
Then select that top level, this then shows the sub levels e.g. Kanto/Tokyo , Kansai etc
selecting one may also show the notes attached to it while still showing the map.

## Mockup of idea
[see example](Screenshot%202026-08-31%20091533.png)
in the mockup, you see a list of note-location in a hierarchy listed underneath eachother.
Asakusa is selected and as such is higlighted.
The map shows markers for places under the current selected place, unless that is the last one (nothing under it) that it just show a marker with the location of the selected place.
On the right side the note is shown.

On mobile the elements could be shown underneath eachother. 

When adding or editing a (new) note-location the user needs to be able to point on the map, where it is , this is converted in long- and latitude which is saved with the note
When adding or editing a note-location the right side can be used to show all the fields 


## Technical notes
Notes and locations are one and the same a note-location. 
Each note-location has the note fields (title, description, created at , updated at, etc) but also the location related fields (longtitude, latitude)
Only the long, lat and title are required that way root notes can be made without them needing content perse.
That does mean that a parent **can** have content **but** doesn't have to

A note-location cannot be reparented for now. 
while i expect this to be able in the backend due to the way rest api's work with the parent field just being the id for instance i don't expect this to be supported by the frontend.

The Map should be open layers as the library and open streetmap as the map source 

the solution will be made in angular and dotnet

The hierarchy is fully user-defined (a note-location's parent is chosen manually by the user),
it is not derived automatically from the coordinates.

There can be more than one root note-location (e.g. one per trip/country).

Note-locations can be archived and then deleted after being archived.
Note-Locations cannot be archived and/or deleted if they have childeren beneath them.
Archived note-locations are still displayed but they are turned grey.
If one presses on them they edit form allows them to be unarchived.
For now one item at the time can be archived and unarchived.
Unarchiving happens through that same edit form (there is no separate "unarchive" action) —
opening an archived note-location for editing shows an archived indicator and lets the user
toggle it back to active from there.

Attempting to archive or delete a note-location that still has children is a blocked action:
the user is shown why it's blocked (it has children) rather than the action silently failing.


The note-location are navigated via the tree.
A search field to find a specific entry would also be nice but it does have to play nice with the navigation tree
this does mean that it can be skipped if ti is too much of a problem initially
The search would be done on Title and Description.
The searchbar should be included in the left side, with the tree,
in the style of a type ahead
Pressing/Selecting from the type ahead opens the item in the tree , which then also opens the note on the right and shows the map in the approriate state

Mobile version should take into account the phone structure, 
perhaps putting the map first and then the tree followed by the context.


Map is always shown,
If nothing is selected it shows the top layers 


## User stories

### Browsing

- As a user, I want to see my top-level locations (e.g. countries) as a list and as pins on the
  map, so I can get an overview of where I've taken notes.
- As a user, I want to select a location in the list or on the map and have the other one
  highlight/focus the same location, so the list and map always stay in sync.
- As a user, I want to select a location and see its direct children as pins on the map (or, if it
  has no children, see a single pin for itself), so I can drill down through the hierarchy.
- As a user, I want to see the ancestor chain (e.g. Japan > Kanto > Tokyo > Asakusa) of the
  currently selected location, so I always know where I am in the hierarchy.
- As a user, I want to see the note content (title, description, etc.) of the currently selected
  location, so I can read my notes without leaving the browsing view.

### Creating and editing

- As a user, I want to add a new note-location under the currently selected location by clicking a
  map position, so the longitude/latitude are captured automatically instead of typed manually.
- As a user, I want to add a new top-level (root) note-location, so I can start a new trip/country
  without needing an existing parent.
- As a user, I want to create a note-location with only a title and a map position, so I can
  quickly capture a place before writing a full note.
- As a user, I want to edit an existing note-location's fields (title, description, position), so
  I can correct or expand my notes later.
- As a user, I want to delete a note-location, so I can remove places I no longer need.

### Archiving

- As a user, I want to archive a note-location that has no children, so I can mark it as no
  longer relevant without losing it outright.
- As a user, I want archived note-locations to still appear in the tree (grayed out), so I can
  still find and review them.
- As a user, I want to open an archived note-location's edit form and unarchive it, so an
  archive decision isn't permanent.
- As a user, I want to be prevented from archiving or deleting a note-location that still has
  children, so I don't lose track of notes nested underneath it.

### Searching

- As a user, I want to type into a search box next to the tree and get type-ahead suggestions
  matching title or description, so I can jump straight to a note-location in a large hierarchy.
- As a user, I want selecting a type-ahead result to open that item in the tree (expanding its
  ancestors), show its note, and update the map, so search feels like just another way to
  navigate rather than a separate view.

### Mobile

- As a user, I want to use the same browsing and editing features on a small screen, with the
  list, map, and note panels stacked instead of side by side, so I can use the app while
  travelling.

## Non-functional notes

- The list of note-locations is expected to grow large ("loads of them"); the UI should not
  assume a small, flat set fits comfortably without hierarchy/collapsing.
- No authentication/multi-user concerns are mentioned yet — assumed single-user for v1 unless
  stated otherwise.
