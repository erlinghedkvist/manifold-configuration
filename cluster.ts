// -----------------------------------------------------------------------------
// IMPORTS
// -----------------------------------------------------------------------------
// These functions are imported from the library file 'layouts_default.ts'.
// They are responsible for creating the default data structures and generating
// the actual database records for the layouts.
import {generate_layouts_parameters,generate_all_layouts}                                                                  from './layoutslib/layouts_default';
import {RASTER_1280x720_ID,RASTER_1920x1080_ID,RASTER_3840x2160_ID}                                                        from './layoutslib/layouts_default';

// Import Layout Configuration IDs (Indices)
// These constants (like OUTSIDE_LAYOUTS_UMD_ID) are simple integers defined in 
// layouts_default.ts  that allow us to target specific "Styles" of layouts 
// (e.g., styles with UMDs outside the video, inside the video, with Tally, etc.).
import {DEFAULT_LAYOUTS_ID,
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
        get_default_md}   from './layoutslib/layouts_default';

// Optional import for specific Riot Games layouts (currently commented out in usage below)
import {get_proviews_valorant} from './layoutslib/layouts_riot';


function init_configuration()
{
   // --------------------------------------------------------------------------
   // ROOT OBJECT STRUCTURE
   // --------------------------------------------------------------------------
   // This object defines the cluster identity and the active configuration state.
   let result = 
   {
      cluster :{
         name : "manifold Cluster 1" 
      },
      cluster_configuration : {
         name         : "Configuration 1", 
         reset        : true, // If true, wipes previous layouts/heads on boot.
         activate     : true  // If true, this config becomes active immediately.
      },
      children        : <any>[] // This array will be populated with Layouts and Heads below.     
   };      
   //

   let child_id                     = 0;                  
   
   //--------------------------------------------------------------------------------------
   // LAYOUTS GENERATION CONFIGURATION
   //--------------------------------------------------------------------------------------            
   // The system does not hard-code every layout (2x2, 3x3, etc.). Instead, it defines
   // "Parameters" for layout families, and then programmatically generates them.
   {
      // 1. Generate Defaults:
      // Creates a default 'parameters' object containing configurations for PIPs 
      // and Rasters.
      let parameters        = generate_layouts_parameters();  
      
      // 2. Global Enable/Disable:
      // Loop through all available configuration slots (LAYOUTS_CONFIGS_NUM = 14).
      // By default, enable standard layouts (grids) and disable complex ones (remote/director).
      for(let i = 0; i < LAYOUTS_CONFIGS_NUM;i++)
      {
         parameters.pip_configurations[i].standard_layouts_enable                       = true;                                       
         parameters.pip_configurations[i].layouts_enable                                = false;
         parameters.pip_configurations[i].remote_layouts_enable                         = false;
         parameters.pip_configurations[i].director_layouts_enable                       = false;
         parameters.pip_configurations[i].vt_coord_layouts_enable                       = false;
      }

       // 3. Custom Layout Definition (Example: USER_4)
       // This block demonstrates how to create a custom "Look" for a layout family.
       // We take a blank slot (USER_4_LAYOUTS_ID) and configure it.
       {
         // Start by cloning an existing style (UMD Outside) to inherit defaults.
         parameters.pip_configurations[USER_4_LAYOUTS_ID]                                    = clone(parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_ID]);
         
         // Name this style 'outside (umd dual)' so it appears distinct in the UI.
         parameters.pip_configurations[USER_4_LAYOUTS_ID].name                               = 'outside (umd dual)';
         
         // Remove the video border (2*0 = 0px width).
         parameters.pip_configurations[USER_4_LAYOUTS_ID].video_source.style_border_width    = 2*0;
         
         // Define the UMD (Under Monitor Display) bar:
         // get_default_md(2) creates a UMD with 2 cells.
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd                                = get_default_md(2);
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.alignment                      = 'outside'; // Place UMD below video 
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.width                          = 1.0;       // UMD matches PIP width
         
         // Configure Cell 0 (Left side of UMD):
         // 'parent_video_source_standard' usually links to the logical source name.
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.cells[0].mode                  = 'parent_video_source_standard',
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.cells[0].width                 = 0.4; // Takes 40% width                     
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.cells[0].style_border_width    = 1;
         
         // Configure Cell 1 (Right side of UMD):
         // 'parent_video_source_name' links to the video source name alias.
         /* Options include: 'parent_video_source_tally_label', 'parent_video_source_user_label_0', etc. */
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.cells[1].mode                  = 'parent_video_source_name', 
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.cells[1].width                 = 0.6; // Takes 60% width          
         parameters.pip_configurations[USER_4_LAYOUTS_ID].umd.cells[1].style_border_width    = 1;  
      }

      // 4. Toggle specific styles ON or OFF
      // This section determines which Layout Families are actually generated.
      // Setting .enable = false prevents the system from generating hundreds of unused layouts.
      {       
         parameters.pip_configurations[DEFAULT_LAYOUTS_ID].enable                       = true;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_ID].enable                   = false; // UMD below video
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_ID].enable               = false; // UMD + Audio Meters outside
         
         // Disable Tally versions to save clutter if not needed
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_TALLY_ID].enable             = false;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].enable         = false;
         
         // Enable "Inside" styles (Overlay)
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_ID].enable                    = false; // UMD inside video
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_ID].enable                = false; // UMD + Audio Meters inside
         
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_TALLY_ID].enable              = false;
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].enable          = false;
         
         // Disable User Custom slots by default
         parameters.pip_configurations[USER_0_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_1_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_2_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_3_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_4_LAYOUTS_ID].enable                        = false; // The custom one defined above is OFF here
      }
      
      // 5. Configure Rasters (Canvas Sizes)
      // Enables 1080p and UHD raster generation. 
      // RASTER_1920x1080_ID corresponds to index 1 in the config array.
      {
         parameters.raster_configurations[RASTER_1920x1080_ID].enable                   = true;
         parameters.raster_configurations[RASTER_1920x1080_ID].layout_style_bgnd_color  = 'black'; //'magenta' is a good alternative
      }
      // 3840x2160 raster
      {
         parameters.raster_configurations[RASTER_3840x2160_ID].enable                   = false;
         parameters.raster_configurations[RASTER_3840x2160_ID].layout_style_bgnd_color  = 'black';
      }    
      
      // 6. Execute Generation
      // Calls the library function to convert the `parameters` object into an array of Layout Objects.
      let layouts                   = generate_all_layouts(parameters);
      
      // (Optional) External Riot Games Layouts
      /*{
         get_proviews_valorant('https://stream.v4.controller.barracks.gg/...',0,layouts);
      }*/

      // 7. Add generated layouts to the result
      {      
         for(let i = 0; i < layouts.length;i++)
         {
            result.children[child_id++] = layouts[i];                     
         }
      }
   }      

   //--------------------------------------------------------------------------------------
   // MULTIVIEWER HEADS CONFIGURATION
   //--------------------------------------------------------------------------------------
   // This array defines the physical/logical outputs. 
   // It maps a Head Name ("MV 1") to a resolution (Raster) and a default starting Layout.

   let heads_description = [
      
      // FHD Heads
      {id : 0,  name : 'MV 1',                video_raster_id :'1920x1080',video_refresh_rate_id : 'p50Hz',layout_id : 37,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
      {id : 1,  name : 'MV 2',                video_raster_id :'1920x1080',video_refresh_rate_id : 'p50Hz',layout_id : 37,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
      {id : 2,  name : 'MV 3',                video_raster_id :'1920x1080',video_refresh_rate_id : 'p50Hz',layout_id : 37,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
      {id : 3,  name : 'MV 4',                video_raster_id :'1920x1080',video_refresh_rate_id : 'p50Hz',layout_id : 37,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
      {id : 4,  name : 'MV 5',                video_raster_id :'1920x1080',video_refresh_rate_id : 'p50Hz',layout_id : 37,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
      {id : 5,  name : 'MV 6',                video_raster_id :'1920x1080',video_refresh_rate_id : 'p50Hz',layout_id : 37,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
      
      // UHD Heads
      {id : 6,  name : 'UHD MV 1',            video_raster_id :'3840x2160',video_refresh_rate_id : 'p50Hz',layout_id : 197,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
      {id : 7,  name : 'UHD MV 2',            video_raster_id :'3840x2160',video_refresh_rate_id : 'p50Hz',layout_id : 197,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
   ];

   // Generate DB records for Heads
   {    
      for(let i = 0; i < 4;i++)
      {               
         let head = {
            db_schema         : 'video',   
            db_table          : 'multiviewer_heads',         
            db_table_records   : [
               {                 
                  //user_afu_id                             : heads_description[i].user_afu_id, //commented out for auto load balance                  
                  name                                    : `head-${i}`,
                  
                  // Define how many NMOS and Ember+ inputs are exposed per Head
                  video_inputs_max_num                    : 32,
                  audio_inputs_max_num                    : 32*4,
                  metadata_inputs_max_num                 : 0,
                  
                  // Define how many audio and metadata streams exist per video. 1 is normally for single 2110-30 16-channel audio streams. 2 would be when there are 2 x 2110-30 8-channel streams for each video
                  audio_inputs_per_video_input_max_num    : 1,
                  metadata_inputs_per_video_input_max_num : 1,
                  
                  display_mode                            : 'on',                                           
                  video_raster_id                         : '1920x1080',
                  video_refresh_rate_id                   : 'p50Hz',
                  layout_id                               : 1,
                  ip_addresses_range_id                   : 10, // Maps to 'Multiviewer Heads IP Range' in cloud.ts
                  video_tcs                               : 'SDR' //Options are : ('SDR','HLG','PQ','LINEAR')
               }
            ]
         };                                              
         result.children[child_id++] = head;       
      }
   }
      
   return result;
}

export let manifold_cluster_configuration =  init_configuration();
