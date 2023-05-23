---
layout: post
title: How to Create a PowerToys Run Plugin
date: 2022-03-12T21:05:00.000Z
tags:
  - powertoys
  - windows
  - tutorial
  - development
---

PowerToys Run is a powerful search utility for Windows 10 that allows you to quickly find and launch applications, files, and more. One of the great things about PowerToys Run is its extensibility - you can create your own plugins to add new functionality and customize the search experience.

In this tutorial, we'll walk through the process of creating a simple PowerToys Run plugin. We'll use an example plugin called Winget (which I created) that allows you to search and install packages from the Winget package manager.

## Prerequisites

Before we get started, make sure you have the following installed on your computer:

- [git](https://git-scm.com/)
- [Visual Studio](https://visualstudio.microsoft.com/) (with the .NET desktop development workload)

## Setting up the Development Environment

First, we must set up our development environment by cloning the PowerToys repository and initializing its submodules. Open a command prompt or terminal and run the following commands:

    git clone https://github.com/microsoft/PowerToys cd PowerToys git submodule update --init --recursive

Next, we'll clone our example Winget plugin into the `PowerToys/src/modules/launcher/Plugins` directory:

    git clone https://github.com/bostrot/PowerToysRunPluginWinget PowerToys/src/modules/launcher/Plugins/Community.PowerToys.Run.Plugin.Winget

Now that we have all of our code in place, let's open the `PowerToys.sln` solution in Visual Studio. You can do this by double-clicking on the `PowerToys.sln` file or by opening Visual Studio and selecting `File > Open > Project/Solution...` and navigating to the `PowerToys.sln` file.

Once Visual Studio has loaded the solution, we need to add our Winget plugin project to it. Right-click on the `PowerToys` solution in the Solution Explorer (under the path `PowerToys/src/modules/launcher/Plugins`) and select `Add > Existing Project...` Navigate to where you cloned our example plugin (`Community.PowerToys.Run.Plugin.Winget`) and select its `.csproj` file (`Community.PowerToys.Run.Plugin.Winget.csproj`). This will add our plugin project to the solution.

## Building and Running

Now that everything is set up, let's build our solution. In Visual Studio, select `Build > Build Solution` (Ctrl+Shift+B). This will compile all of our code and create an executable for us.

Once everything has finished building successfully, we can run our new plugin! In Visual Studio, right-click on the `PowerToys` project in the Solution Explorer and select `Set as StartUp Project`. Then press `F5` or click on the green play button in Visual Studio to start debugging. This will launch PowerToys with our new Winget plugin installed!

## Adjusting

In the `plugin.json` you can adjust the name + trigger command and change that to your needs. Also, if you want to use the example as a starting point, Find + Replace all `Community.PowerToys.Run.Plugin.Winget` into your new name would be the easiest way to go. You then also need to replace all occurrences of `winget` with your trigger command and name.

## Conclusion

In this tutorial, we've walked through the process of creating a simple PowerToys Run plugin. We've shown how to set up your development environment, add a new plugin project to the PowerToys solution, build everything, and run your new plugin. With this knowledge in hand, you can now create your own custom plugins for PowerToys Run!

## Resources

<https://github.com/bostrot/PowerToysRunPluginWinget>\
<https://github.com/microsoft/PowerToys>\
<https://github.com/lin-ycv/EverythingPowerToys>\
<https://github.com/naari3/PowerToysRunPluginSample>\
<https://learn.microsoft.com/en-us/windows/powertoys/run>\
<https://docs.microsoft.com/en-us/windows/package-manager/winget/>
