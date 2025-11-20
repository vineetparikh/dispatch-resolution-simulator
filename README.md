# Dispatch Resolution Simulator

This site is a (hurriedly put together) basic implementation/simulator of the main resolution mechanic in [Dispatch](https://en.wikipedia.org/wiki/Dispatch_(video_game)), a game about dispatching superheroes to solve problems on the fly. 

## Building and running the simulator
This is deployed on Github Pages, but if you'd like to run it yourself:
- clone the repo via `git clone`
- cd into the repo and `npm install` all the dependencies (this uses React + Vite and some other libraries to help with simulating the polygon)
- `npm run dev` to get a local dev instance running
- GH Pages should be building from main, so if you want to deploy then just push to main. Please don't do this without PRs though.

## Why I made this

Most critical acclaim about the game thus far focused primarily on the narrative TellTale-style gameplay, animation, voice acting, and characters, which makes sense: these are all really good! 

I however think the actual dispatch gameplay, especially the core resolution mechanic, is underappreciated at the moment and is actually pretty groundbreaking for future RPG-style games. IMO, the "bouncing ball check" (draw a shape for the task, draw a shape for player skills, and bounce a ball) has *so many* implications in RPG design that elevate it above other resolution mechanics like dX+bonus or dice pools, while keeping the same principles of randomness in the underlying chances + build expression by steering that randomness.

For example: challenges/tasks can be made to act multi-attribute almost immediately, and skill points in a particular task could be distributed across the attributes to shore up weaknesses

The system can even model stats using the very physics of the bouncing ball: maybe a lucky character has a ball that moves very slowly so it rarely moves out of center.

Character synergies (and lack thereof) can even be expressed by adding together individual attributes much like how Dispatch does them, and concepts like "advantage/disadvantage" or situational boosts/nerfs can involve adding more balls or running a check multiple times with the same initial inputs

Finally, the "auto-bonus"/"auto-fail" sections also help add more than just the physics, though I wonder if another cool idea is to add bumpers like a pinball game

I looked around and didn't see anything online that replicated this nor did I see this mechanic in other games (though I might just be msising something, so please let me know if there is one!), so I quickly coded up an online simulator based on my singular playthrough of the game which can also work. It's not perfect, but I'd appreciate feedback and I'm hopeful that maybe we'll see this resolution system in more RPGs in the future (maybe even the CritRole game?)

## Contributing and feedback

This is pretty minimal, so I'd appreciate feedback on what modifications people might like to see (and especially would appreciate PRs if people have feature ideas). This is also a relatively small side project though, so I may not be able to get to things anytime soon.
