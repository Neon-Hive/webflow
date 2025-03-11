# N4 Webflow CDN Script & Styling

This repository is set to handle multiple higher-level optimisation clients based in Webflow. The idea is that we serve our own minfied scripts to Webflow sites, saving a lot of network data and increasing speed.

## Usage & Minification Workflows
Simply upload any JS file and our workflow will squash the file to be a min.js

You can then use the file on your site by following the below structure
<script src="https://cdn.jsdelivr.net/gh/Neon-Hive/webflow/< YOUR_FOLDER >/< YOUR_SCRIPT >.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
Add defer/async or other params as needed :)

## CDN Cache
Use https://www.jsdelivr.com/tools/purge to purge cache on the CDN to avoid waiting 15-20mins between changes


