// -----------------------------------------------------------------------------
// MANIFOLD CLOUD CONFIGURATION
// -----------------------------------------------------------------------------
// This file combines the former cloud.ts and cluster.ts configurations. It
// defines the hardware and licenses available to manifold CLOUD, cluster-level
// networking and protocol settings, generated layouts, services, and 3D LUTs.
// The completed payload is posted to the /configuration API endpoint below.

// Layout helpers create the default parameter structures and turn the enabled
// layout families and raster configurations into configuration records.
import ManifoldCloudAPI from './manifold_cloud_api.js';
import {
        generate_layouts_parameters,
        generate_all_layouts,
        configure_default_ppm_layouts,
        configure_existing_umd_modes,
        configure_existing_omd_modes,
        RASTER_1920x1080_ID,
        RASTER_3840x2160_ID,
        DEFAULT_LAYOUTS_ID,
        OUTSIDE_LAYOUTS_UMD_ID,
        OUTSIDE_LAYOUTS_UMD_PPM_ID,
        OUTSIDE_LAYOUTS_UMD_TALLY_ID,
        OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID,
        INSIDE_LAYOUTS_UMD_ID,
        INSIDE_LAYOUTS_UMD_PPM_ID,
        INSIDE_LAYOUTS_UMD_TALLY_ID,
        INSIDE_LAYOUTS_UMD_PPM_TALLY_ID,
        USER_0_LAYOUTS_ID,
        USER_1_LAYOUTS_ID,
        USER_2_LAYOUTS_ID,
        USER_3_LAYOUTS_ID,
        USER_4_LAYOUTS_ID,
        LAYOUTS_CONFIGS_NUM,
        clone,
        get_default_md
} from './layouts_default.js';
import type {
        MonitorDisplayMode,
        PpmValueConfiguration
} from './layouts_default.js';
import * as fs from 'fs/promises';
import * as path from 'path';

function get_layouts()
{
	// Layouts are generated from family-level parameters rather than being
      // defined individually (for example, every 2x2, 3x3, or featured layout).
	let parameters        = generate_layouts_parameters();

      // Select which families are available in every PIP style:
      //   standard_layouts_enable: regular grids (1-, 4-, 9-, 16-way, etc.)
      //   layouts_enable: asymmetric/featured layouts (6-, 7-, 8-way, etc.)
      //   remote/director/vt_coord: specialized operational layouts
      //   big/riot: additional large and Riot-specific layout families
      for(let i = 0; i < LAYOUTS_CONFIGS_NUM;i++)
      {
         parameters.pip_configurations[i].standard_layouts_enable                       = true;
         parameters.pip_configurations[i].layouts_enable                                = true;
         parameters.pip_configurations[i].remote_layouts_enable                         = false;
         parameters.pip_configurations[i].director_layouts_enable                       = false;
         parameters.pip_configurations[i].vt_coord_layouts_enable                       = false;
         parameters.pip_configurations[i].big_layouts_enable                            = false;
         parameters.pip_configurations[i].riot_layouts_enable                           = false;
      }

      // Set the default text source for every existing UMD and OMD cell. Supply
      // one mode for all cells or an array for per-cell mapping; if a display
      // has more cells than entries, the last entry is reused.
      {
         let default_umd_modes : MonitorDisplayMode[] = ['parent_video_source_tally_label'];
         let default_omd_modes : MonitorDisplayMode[] = ['parent_video_source_standard_interface'];

         configure_existing_umd_modes(parameters,default_umd_modes);
         configure_existing_omd_modes(parameters,default_omd_modes);
      }

       // Example of deriving a custom layout style from an existing family.
       // get_default_md(2) creates a two-cell UMD (Under Monitor Display).
       // Monitor-display cell mode options include:
       //   'label', 'parent_video_source_name',
       //   'parent_video_source_standard', 'parent_video_source_tally_label',
       //   'parent_video_source_user_label_0',
       //   'parent_video_source_user_label_1',
       //   'parent_video_source_standard_interface',
       //   'parent_video_source_standard_tcs'.
       {
         parameters.pip_configurations[USER_4_LAYOUTS_ID]                                    = clone(parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_ID]);
         parameters.pip_configurations[USER_4_LAYOUTS_ID].name                               = 'outside (umd dual)';
         parameters.pip_configurations[USER_4_LAYOUTS_ID].video_source.style_border_width    = 2*0;
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd                                = get_default_md(2);
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.alignment                      = 'outside';
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.width                          = 1.0;
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.cells[0].mode                  = 'parent_video_source_standard',
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.cells[0].width                 = 0.4;
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.cells[0].style_border_width    = 1;
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.cells[1].mode                  = 'parent_video_source_name',
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.cells[1].width                 = 0.6;
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.cells[1].style_border_width    = 1;
         // Show alarms on the selected style, including a logo when no source is
         // assigned. PPM channel mapping is configured globally below.
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].video_source.alarms_enable                                   = true;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].video_source.alarms_on_video_source_not_assigned_show_logo   = true;
      }

      // Configure PPM meter count, channel mapping, and adaptive width for all
      // built-in PPM layout styles. Channel counts and offsets accept either a
      // number applied to every meter or an array with one value per meter.
      {
         type PpmConfigurationMode = 'preset' | 'manual';
         type PpmPreset = 'split_16ch' | 'mirrored_8ch' | 'quad_4ch_zero';

         let ppm_configuration_mode : PpmConfigurationMode = 'preset';

         //   split_16ch: left channels 0-7, right channels 8-15
         //   mirrored_8ch: both sides show channels 0-7
         //   quad_4ch_zero: two meters per side, each showing channels 0-3
         let ppm_preset : PpmPreset = 'split_16ch';

         // Manual values are used when ppm_configuration_mode is 'manual'.
         // Arrays provide per-meter control, for example [2,2] channels with
         // offsets [0,2] creates meters for channels 0-1 and 2-3.
         let ppm_meters_left = 1;
         let ppm_channels_left : PpmValueConfiguration = 8;
         let ppm_channels_offset_left : PpmValueConfiguration = 0;
         let ppm_meters_right = 1;
         let ppm_channels_right : PpmValueConfiguration = 8;
         let ppm_channels_offset_right : PpmValueConfiguration = 8;

         if(ppm_configuration_mode == 'preset')
         {
            switch(ppm_preset as string)
            {
               case 'split_16ch':
                  ppm_meters_left = 1;
                  ppm_channels_left = 8;
                  ppm_channels_offset_left = 0;
                  ppm_meters_right = 1;
                  ppm_channels_right = 8;
                  ppm_channels_offset_right = 8;
                  break;
               case 'mirrored_8ch':
                  ppm_meters_left = 1;
                  ppm_channels_left = 8;
                  ppm_channels_offset_left = 0;
                  ppm_meters_right = 1;
                  ppm_channels_right = 8;
                  ppm_channels_offset_right = 0;
                  break;
               case 'quad_4ch_zero':
                  ppm_meters_left = 2;
                  ppm_channels_left = 4;
                  ppm_channels_offset_left = 0;
                  ppm_meters_right = 2;
                  ppm_channels_right = 4;
                  ppm_channels_offset_right = 0;
                  break;
               default:
                  throw new Error(`Unknown PPM preset: ${ppm_preset}`);
            }
         }

         let ppm_width = 0.05;
         let ppm_width_max = 0.09;
         let ppm_channel_min_width = 4;

         configure_default_ppm_layouts(parameters,
                                       ppm_meters_left,
                                       ppm_channels_left,
                                       ppm_channels_offset_left,
                                       ppm_meters_right,
                                       ppm_channels_right,
                                       ppm_channels_offset_right,
                                       ppm_width,
                                       ppm_width_max,
                                       ppm_channel_min_width);
      }

      // Enable only the PIP styles that should be generated. Disabling unused
      // styles avoids creating hundreds of unnecessary layout records.
      // "outside" places UMD/PPM elements around the video; "inside" overlays
      // them on the video. TALLY variants add tally indication.
      {
         parameters.pip_configurations[DEFAULT_LAYOUTS_ID].enable                       = true;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_ID].enable                   = true;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_ID].enable               = true;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_TALLY_ID].enable             = true;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].enable         = true;
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_ID].enable                    = true;
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_ID].enable                = true;
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_TALLY_ID].enable              = true;
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].enable          = true;
         parameters.pip_configurations[USER_0_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_1_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_2_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_3_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_4_LAYOUTS_ID].enable                        = false;

      }
      // Enable and style the 1920x1080 layout raster.
      {
         parameters.raster_configurations[RASTER_1920x1080_ID].enable                   = true;
         parameters.raster_configurations[RASTER_1920x1080_ID].layout_style_bgnd_color  = 'black';//'magenta';
      }
      // Keep the UHD raster available for configuration but do not generate its
      // layouts unless it is explicitly enabled here.
      {
         parameters.raster_configurations[RASTER_3840x2160_ID].enable                   = false;
         parameters.raster_configurations[RASTER_3840x2160_ID].layout_style_bgnd_color  = 'black';//'black';
      }
      let layouts                   = generate_all_layouts(parameters);
      return layouts;		
      
}

function get_services()
{ 
  // Services are emitted in the API's schema/table/records form. The loop bound
  // controls how many instances of each service type are created; a bound of 0
  // disables that service block.
  //
  // Common video_raster_id values:
  //   '720x486', '720x576', '1280x720', '1920x1035', '1920x1080',
  //   '2048x1080', '3840x2160', '4096x2160', '7680x4320', '8192x4320'.
  // Common video_refresh_rate_id values:
  //   'p23.98Hz', 'sF23.98Hz', 'p24Hz', 'sF24Hz', 'p25Hz', 'sF25Hz',
  //   'p29.97Hz', 'sF29.97Hz', 'p30Hz', 'sF30Hz', 'p47.95Hz',
  //   'i47.95Hz', 'p48Hz', 'i48Hz', 'p50Hz', 'i50Hz', 'p59.94Hz',
  //   'i59.94Hz', 'p60Hz', 'i60Hz', 'p100Hz', 'p119.88Hz', 'p120Hz'.
  let  services = <any>[];

  let child_id = 0;

  // Video test generators create synthetic video streams. pattern_type chooses
  // the image/motion pattern, and ip_addresses_range_id selects the output
  // multicast range defined later in this file.
  for(let i = 0; i < 0;i++)
    {
      let pattern_types     = ['colour','counter v','counter h','counter hv','counter vh'];
      let pattern_type_id   = 1+i%4;
      let pattern_type      = pattern_types[pattern_type_id];
  
      let video_testgen = {
        db_schema                                : 'video',
        db_table                                 : 'test_generators',
        db_table_records                         :
        [
          {
	          //user_afu_id                        :  2,	
            name                               : `Video TP ${i}`,
            //video standard
            video_raster_id                    : '1920x1080',
            video_refresh_rate_id              : 'p59.94Hz',
            //test_generator specific
            pattern_type                       : pattern_type,
            inserted_id                        : i,
            inserted_id_enable                 : true,
            frame_id                           : 0,
            input_frames_num                   : 3,
            colour_c0                          : 512,
            colour_c1                          : 512,
            colour_c2                          : 512,
            //
            insert_motion_enable               : true,
            insert_motion_colour               : 0,
            enable_output_rl                   : false,
            ip_addresses_range_id              : 2,
            output_stream_enable               : true
        }
      ]
      };
      services[child_id++] = video_testgen;
    }

    
 
    let heads_description = [
      
      // FHD Heads
      {id : 0,  name : 'MANIFOLD MV 1',                video_raster_id :'1920x1080',video_refresh_rate_id : 'p59.94Hz',layout_id : 1,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
      {id : 1,  name : 'MANIFOLD MV 2',                video_raster_id :'1920x1080',video_refresh_rate_id : 'p59.94Hz',layout_id : 1,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
      {id : 2,  name : 'MANIFOLD MV 3',                video_raster_id :'1920x1080',video_refresh_rate_id : 'p59.94Hz',layout_id : 1,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
      {id : 3,  name : 'MANIFOLD MV 4',                video_raster_id :'1920x1080',video_refresh_rate_id : 'p59.94Hz',layout_id : 1,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
      {id : 4,  name : 'MANIFOLD MV 5',                video_raster_id :'1920x1080',video_refresh_rate_id : 'p59.94Hz',layout_id : 1,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
      {id : 5,  name : 'MANIFOLD MV 6',                video_raster_id :'1920x1080',video_refresh_rate_id : 'p59.94Hz',layout_id : 1,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
      
      // UHD Heads
      //{id : 6,  name : 'MANIFOLD UHD MV 1',            video_raster_id :'3840x2160',video_refresh_rate_id : 'p59.94Hz',layout_id : 1,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
      //{id : 7,  name : 'MANIFOLD UHD MV 2',            video_raster_id :'3840x2160',video_refresh_rate_id : 'p59.94Hz',layout_id : 1,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
   ];


 // Generate multiviewer heads
 
  for(let i = 0; i < heads_description.length;i++)
  {               
                                       
    let multiviewer_head = {
      db_schema         : 'video',   
      db_table          : 'multiviewer_heads',         
      db_table_records   : [
              {                 
                //user_afu_id                             : heads_description[i].user_afu_id,  //Used to pin a service to a dedicated AFU. Comment out for auto load balance                  
                name                                    : heads_description[i].name,
                video_inputs_max_num                    : heads_description[i].video_inputs_max_num,
                audio_inputs_max_num                    : heads_description[i].audio_inputs_max_num,
                metadata_inputs_max_num                 : heads_description[i].metadata_inputs_max_num,
                audio_inputs_per_video_input_max_num    : 1,
                metadata_inputs_per_video_input_max_num : 1,
                display_mode                            : 'on',                                           
                video_raster_id                         : heads_description[i].video_raster_id,
                video_refresh_rate_id                   : heads_description[i].video_refresh_rate_id,
                layout_id                               : heads_description[i].layout_id,                                               
                ip_addresses_range_id                   : 4
             }
      ]
    };                                              
    services[child_id++] = multiviewer_head;       
  }  
  // UDX services perform video format conversion. Their output multicast
  // addresses are allocated from the selected ip_addresses_range_id.
  for(let i = 0; i < 0;i++)
  {     
    let udx = {
      db_schema                                : 'video',
      db_table                                 : 'udxs',
      db_table_records                         :
      [
        {            
	          //user_afu_id                        : 1,	
            name                               : `UDX ${i}`,
            //video standard
            video_raster_id                    : '1920x1080',
            video_refresh_rate_id              : 'p59.94Hz',//'i59.94Hz',
            //
            ip_addresses_range_id              : 6//(i<32)?4:5
        }
      ]
    };
    services[child_id++] = udx;
  }

  return services;
}

async function get_luts3D()
{
  // Import every Type III .cube file in this directory. The filename becomes
  // the LUT title and the complete file contents are sent as lut_data.
  const folderPath: string = './3dluts/LUTS_for_Hardware_Devices_TypeIII_CUBE_LUT_Format';       
  const files: string[] = await fs.readdir(folderPath);       
  const cubeFiles = await files.filter((file) => { return path.extname(file).toLowerCase() === '.cube';});

  //console.log(`files: ${files}`);    

  
  let  luts = <any>[];
  let child_id = 0;

  for (const file of cubeFiles) 
  {
    const nameWithoutExt = path.parse(file).name;
    const filePath: string = path.join(folderPath, file);
        
    const stats = await fs.stat(filePath);
    if(stats.isFile()) 
    {
      console.log(`file: ${file} lut_name ${nameWithoutExt} Full path: ${filePath}`);      
      const fileContent: string =  await fs.readFile(filePath, 'utf-8');
      const lut = { 
              title    : nameWithoutExt,
              lut_data : fileContent
            };      
      luts[child_id++] = lut;               
    }
  }

  return luts;
}

// MANIFOLD_JOBS_WS_URL may override the API client's default local jobs socket.
const api = new ManifoldCloudAPI('http://127.0.0.1/v1/manifold/');
//const api = new ManifoldCloudAPI('http://172.16.218.169/v1/manifold/');


async function run() {
    
    try {
       
        await api.login('admin', 'password');  
        //console.log('Logged in, token:', api.getToken());

        // The filter controls which configuration areas the API applies. When
        // reset is true, the selected areas are cleared before this payload is
        // loaded. Set an area to false to leave its current state unchanged.
        const cloud_configuration_payload_filter =
        {
          //reset all before load
          reset           : true,
          //
          hardware        : true,
          clusters        : true,
          licenses        : true,
          services        : true,
          sources_routing : true,
          luts3D          : true,
          system_layouts  : true,
          user_layouts    : true
        };  
	                
        // The payload contains both cloud-wide resources and cluster-specific
        // configuration. Array order supplies the local ids referenced by fields
        // such as ip_addresses_range_id.
        const cloud_configuration_payload =
          {            
            // Hardware inventory. A node is a server reachable at ctrl_ipaddr;
            // on_node_id identifies each accelerator within that server.
            // Supported accelerator_type values include:
            //   'Bittware:520N-MX', 'prodesign:FALCON-Stratix', 'arkona:AT300'
            nodes : [
              {
                name        : "Manifold Server",
                ctrl_ipaddr : "127.0.0.1",
                accelerators:
                [
                    {accelerator_type : "prodesign:FALCON-Stratix",on_node_id : 0},
                    //{accelerator_type : "Bittware:520N-MX",on_node_id : 1},
                    //{accelerator_type : "Bittware:520N-MX",on_node_id : 2},
                    //{accelerator_type : "Bittware:520N-MX",on_node_id : 3}
                ]
              }
            ],

            // License tokens make licensed capacity/features available to the
            // configured hardware and clusters.
            licenses : [ { "name":"license key 1",
                           "token" : "enter license token here"} ],

	          // System and user layouts generated by get_layouts().
	          layouts :  get_layouts(),		

            // 3D LUTs loaded from the local .cube files by get_luts3D().
            luts3D   : await get_luts3D(),

            // Each entry declares a cluster and the hardware, address ranges,
            // and services assigned to it.
            clusters : [
              {
                cluster : 
                { "name"                                        :"Manifold Cluster",
                  // A stable UUID. A fixed value preserves its NMOS device
                  // identity across restarts and configuration reloads.
                  "id_uuid"                                    : "92070b3c-5a7c-11f1-a4cc-0f76e58751a5", 

                  // Per-port MAC assignment:
                  //   'manual': use mac_address values from accelerators_ports_addresses
                  //   'auto': generate sequential MACs from the start value
                  "network_ports_mac_address_assignment_mode"   : 'auto',//'manual',                     
                  "network_ports_auto_mac_address_start"        :"00:50:c2:f6:cb:00",
                  "network_ports_auto_mac_address_inc"          : 1,             
                  // Per-port IP assignment:
                  //   'manual': use ip_address values from accelerators_ports_addresses
                  //   'auto': allocate the requested count sequentially from the start
                  "network_ports_address_assignment_mode"      : 'manual',//'manual' or 'auto'                
                  "network_ports_auto_ip_address_start"        :"10.40.0.16",
                  "network_ports_auto_ip_address_num"          : 16,
                  // Remove discovered sources that are no longer in use when the
                  // configuration is applied.
                  "clear_unused_sources"                      : true,

                  // Ingress routing mode:
                  //   'sps': ST 2022-7 seamless protection switching
                  //   'auto': load balance across both AFU network interfaces
                  //   'afu0'/'afu1': receive only on the selected interface
                  "ingress_sources_routing_mode"              : 'sps',//'sps',//'afu port 0',//'auto',//'afu port 1'                                                                          

                  // PTP synchronization and domain used by this cluster.
                  "ptp_enable"                                : true,
                  "ptp_domain_number"                         : 127,                                                                          

                  // Ember+ control server port.
                  "ember_port"                                : 9000,

                  // TSL UMD v5 tally/label connections. Heads are distributed
                  // across tsl_connections_num connections, with at most
                  // tsl_screens_per_connection heads on each connection.
                  "tsl_connections_num"                       : 1,
                  "tsl_screens_per_connection"                : 65535,
                  "tsl_udp_port"                              : 8800,
                  "tsl_tcp_port"                              : 8801,
                  // Optional Plura timer sources.
                  //"plura_timers"                              : ["172.16.0.231"],							       

                  // IS-04/IS-05 registry URL and the host addresses advertised
                  // for senders/receivers. Advertised hosts are normally the
                  // server's management IP addresses.
                  "nmos_registry_url"                         : "http://localhost:80",
                  "nmos_advertised_hosts"                     : ["10.10.1.58"]
                },            

                // Explicit per-port addresses used by either manual assignment
                // mode. Entries correspond to the network ports on the cluster's
                // assigned accelerators.
                accelerators_ports_addresses : [                                                                        
                  {mac_address : "00:50:c2:f6:00:00",ip_address : "172.20.1.28"},
                  {mac_address : "00:50:c2:f6:00:01",ip_address : "172.20.2.28"},
                  {mac_address : "00:50:c2:f6:00:02",ip_address : "172.20.1.29"},
                  {mac_address : "00:50:c2:f6:00:03",ip_address : "172.20.2.29"},
                  {mac_address : "00:50:c2:f6:00:04",ip_address : "10.151.1.45"},
                  {mac_address : "00:50:c2:f6:00:05",ip_address : "10.151.2.45"},
                  {mac_address : "00:50:c2:f6:00:06",ip_address : "10.151.1.47"},
                  {mac_address : "00:50:c2:f6:00:07",ip_address : "10.151.2.47"},                                                                        
                  {mac_address : "00:50:c2:f6:00:08",ip_address : "10.151.1.49"},
                  {mac_address : "00:50:c2:f6:00:09",ip_address : "10.151.2.49"},
                  {mac_address : "00:50:c2:f6:00:10",ip_address : "10.151.1.51"},
                  {mac_address : "00:50:c2:f6:00:11",ip_address : "10.151.2.51"},
                  {mac_address : "00:50:c2:f6:00:12",ip_address : "10.151.1.53"},
                  {mac_address : "00:50:c2:f6:00:13",ip_address : "10.151.2.53"},
                  {mac_address : "00:50:c2:f6:00:14",ip_address : "10.151.1.55"},
                  {mac_address : "00:50:c2:f6:00:15",ip_address : "10.151.2.55"}
                ],

                // Assign hardware from the nodes inventory to this cluster. A
                // whole node may be selected by node_name, or individual
                // accelerators can be selected using the forms shown below.
                accelerators : [         
                  //{ accelerator_server : {name : "manifold400g"}}         
                  //{ node : {name : "FALCON-NEST - 0",accelerators : [0]}}                  
                  { node_name : "Manifold Server"}                 
                ],

                // Multicast pools from which services allocate output addresses.
                // A primary range is always used; its paired secondary range is
                // used for SPS/ST 2022-7 outputs. ip_addresses_range_id on a
                // service refers to the zero-based position in this array.
                //
                // Fields:
                //   ip_addresses_start: first multicast address in the block
                //   ip_addresses_num: number of addresses available
                //   inc_mode: address increment order ('X_X_1_1' or 'X_1_X_1')
                //   sources_routing_mode: 'sps', 'auto', 'afu0', or 'afu1'
                //   udp_src_port/udp_dst_port: RTP/UDP transport ports
                //   rtp_payload_type: RTP payload type for generated streams
                services_ip_addresses_ranges : [                                                                                         
                  {"name":"RL Generators IP Range","ip_addresses_start":'237.0.0.0',"ip_addresses_num":8192,"inc_mode":'X_X_1_1',"sources_routing_mode":'sps',udp_src_port: 9000,udp_dst_port : 9000,rtp_payload_type : 96},
                  {"name":"RL Generators IP Range","ip_addresses_start":'237.1.0.0',"ip_addresses_num":8192,"inc_mode":'X_X_1_1',"sources_routing_mode":'sps',udp_src_port: 9000,udp_dst_port : 9000,rtp_payload_type : 96},                                   
                  {"name":"Video Test Patterns IP Range Primary","ip_addresses_start":'237.0.16.0',"ip_addresses_num":1024,"inc_mode":'X_X_1_1',"sources_routing_mode":'sps',udp_src_port: 9000,udp_dst_port : 9000,rtp_payload_type : 96},
                  {"name":"Video Test Patterns IP Range Secondary","ip_addresses_start":'237.1.16.0',"ip_addresses_num":1024,"inc_mode":'X_X_1_1',"sources_routing_mode":'sps',udp_src_port: 9000,udp_dst_port : 9000,rtp_payload_type : 96},                                                                                                                                             
                  {"name":"Multiviewer Heads IP Range Primary","ip_addresses_start":'237.0.32.0',"ip_addresses_num":1024,"inc_mode":'X_X_1_1',"sources_routing_mode":'sps',udp_src_port: 9000,udp_dst_port : 9000,rtp_payload_type : 96},
                  {"name":"Multiviewer Heads IP Range Secondary","ip_addresses_start":'237.1.32.0',"ip_addresses_num":1024,"inc_mode":'X_X_1_1',"sources_routing_mode":'sps',udp_src_port: 9000,udp_dst_port : 9000,rtp_payload_type : 96},
                  {"name":"UDX IP Range Primary","ip_addresses_start":'237.0.48.0',"ip_addresses_num":1024,"inc_mode":'X_X_1_1',"sources_routing_mode":'sps',udp_src_port: 9000,udp_dst_port : 9000,rtp_payload_type : 96},
                  {"name":"UDX IP Range Secondary","ip_addresses_start":'237.1.48.0',"ip_addresses_num":1024,"inc_mode":'X_X_1_1',"sources_routing_mode":'sps',udp_src_port: 9000,udp_dst_port : 9000,rtp_payload_type : 96}         
                ],                
                // Service instances generated for this cluster.
                services : get_services(),                
              }
            ]
          };         
          ///console.log('cloud_configuration:', cloud_configuration_payload);

          
        // Pair the area-selection filter with its replacement configuration.
        const cloud_configuration =
        {
          filter  : cloud_configuration_payload_filter,
          payload : cloud_configuration_payload
        } ; 


        //const payload = JSON.stringify(cloud_configuration);  
        //console.log(`Content-Length: ${Buffer.byteLength(payload)} bytes`);


        //console.log('cloud_configuration_payload_filter:', cloud_configuration_payload_filter);
        //console.log('cloud_configuration:', cloud_configuration);
  

        //const payload = JSON.stringify(cloud_configuration);  
        //console.log(`Content-Length: ${Buffer.byteLength(payload)} bytes`);  


        // Applying hardware, layouts, LUTs, and services may take several
        // minutes, so wait for the asynchronous configuration job to complete.
        const configuration_result = await api.post_and_wait('/configuration',cloud_configuration,180000);
        //services_test_routing(api,configuration);
        
        //services_test_tally_and_labels(api,configuration);

        console.log('configuration result:',configuration_result);
                                        

    } catch (err: any) {
      console.error('API Error:', err.message);
    }
  }
  
  run();
