// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $api_nixlr_v1_discovery_mac_ from "./routes/api/nixlr/v1/discovery/[mac].ts";
import * as $api_nixlr_v1_discovery_index from "./routes/api/nixlr/v1/discovery/index.ts";
import * as $api_nixlr_v1_maintainance_lock_name_ from "./routes/api/nixlr/v1/maintainance/lock/[name].ts";
import * as $api_nixlr_v1_maintainance_secret_name_ from "./routes/api/nixlr/v1/maintainance/secret/[name].ts";
import * as $api_nixlr_v1_provision_info_name_ from "./routes/api/nixlr/v1/provision/info/[name].ts";
import * as $api_nixlr_v1_provision_info_index from "./routes/api/nixlr/v1/provision/info/index.ts";
import * as $api_nixlr_v1_provision_status_name_ from "./routes/api/nixlr/v1/provision/status/[name].ts";
import * as $api_nixlr_v1_provision_status_index from "./routes/api/nixlr/v1/provision/status/index.ts";
import * as $api_pixiecore_v1_boot_mac_ from "./routes/api/pixiecore/v1/boot/[mac].ts";
import * as $index from "./routes/index.tsx";

import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/api/nixlr/v1/discovery/[mac].ts": $api_nixlr_v1_discovery_mac_,
    "./routes/api/nixlr/v1/discovery/index.ts": $api_nixlr_v1_discovery_index,
    "./routes/api/nixlr/v1/maintainance/lock/[name].ts":
      $api_nixlr_v1_maintainance_lock_name_,
    "./routes/api/nixlr/v1/maintainance/secret/[name].ts":
      $api_nixlr_v1_maintainance_secret_name_,
    "./routes/api/nixlr/v1/provision/info/[name].ts":
      $api_nixlr_v1_provision_info_name_,
    "./routes/api/nixlr/v1/provision/info/index.ts":
      $api_nixlr_v1_provision_info_index,
    "./routes/api/nixlr/v1/provision/status/[name].ts":
      $api_nixlr_v1_provision_status_name_,
    "./routes/api/nixlr/v1/provision/status/index.ts":
      $api_nixlr_v1_provision_status_index,
    "./routes/api/pixiecore/v1/boot/[mac].ts": $api_pixiecore_v1_boot_mac_,
    "./routes/index.tsx": $index,
  },
  islands: {},
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;