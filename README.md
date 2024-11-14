# N4 Webflow CDN Script & Styling

This repository is set to handle multiple higher-level optimisation clients based in Webflow. The idea is that we serve our own minfied scripts to Webflow sites, saving a lot of network data and increasing speed.

## Usage & Minification Workflows
Simply upload any JS file and our workflow will squash the file to be a min.js

You can then use the file on your site by following the below structure
<script src="https://cdn.jsdelivr.net/gh/Neon-Hive/webflow/< YOUR_FOLDER >/< YOUR_SCRIPT >.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
Add defer/async or other params as needed :)

## Prerequisites 
It can sometimes take jsdelivr some time to replace the cached file globally on its CDN. This means that if you make fast changes to the file they will not be represented throughout the world quickly (usually takes 10-15mins)
Best to only commit files to this repo if the code has been tested locally and is unlikely to change for a period of time.


