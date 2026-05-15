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
        get_default_md,
        get_default_ppms}   from './layoutslib/layouts_default';

// Optional import for specific Riot Games layouts (currently commented out in usage below)
import {get_proviews_valorant} from './layoutslib/layouts_riot';

type PpmValueConfiguration = number | number[];
type PpmPreset = 'split_16ch' | 'mirrored_8ch' | 'quad_4ch_zero';

function get_ppm_value(value : PpmValueConfiguration, index : number)
{
   if(Array.isArray(value))
   {
      return value[index] ?? value[value.length - 1];
   }

   return value;
}

function validate_ppm_parameters(ppm_meters : number,
                                 ppm_channels : PpmValueConfiguration,
                                 ppm_channels_offset : PpmValueConfiguration,
                                 ppm_width : number,
                                 ppm_width_max : number,
                                 ppm_channel_min_width : number,
                                 side_name : string)
{
   if(ppm_meters < 0)
   {
      throw new Error(`${side_name}: ppm_meters must be 0 or greater`);
   }
   if(ppm_width <= 0)
   {
      throw new Error(`${side_name}: ppm_width must be greater than 0`);
   }
   if(ppm_width_max < ppm_width)
   {
      throw new Error(`${side_name}: ppm_width_max must be greater than or equal to ppm_width`);
   }
   if(ppm_channel_min_width <= 0)
   {
      throw new Error(`${side_name}: ppm_channel_min_width must be greater than 0`);
   }
   if(Array.isArray(ppm_channels) && ppm_channels.length == 0)
   {
      throw new Error(`${side_name}: ppm_channels array must not be empty`);
   }
   if(Array.isArray(ppm_channels_offset) && ppm_channels_offset.length == 0)
   {
      throw new Error(`${side_name}: ppm_channels_offset array must not be empty`);
   }

   for(let i = 0; i < ppm_meters;i++)
   {
      if(get_ppm_value(ppm_channels,i) <= 0)
      {
         throw new Error(`${side_name}: ppm_channels must be greater than 0`);
      }
      if(get_ppm_value(ppm_channels_offset,i) < 0)
      {
         throw new Error(`${side_name}: ppm_channels_offset must be 0 or greater`);
      }
   }
}

function copy_ppm_cell_style(target_cell : any, source_cell : any)
{
   if(source_cell == null)
   {
      return;
   }

   for(let key of Object.keys(source_cell))
   {
      // Keep cluster.ts in charge of channel mapping and visibility. Some legacy
      // inside PPM styles use style_opacity=0, which hides the rebuilt widgets.
      if((key != 'channels_offset') && (key != 'channels_num') && (key != 'style_opacity'))
      {
         target_cell[key] = source_cell[key];
      }
   }
}

function build_ppms_from_parameters(existing_ppms : any,
                                    ppm_meters : number,
                                    ppm_channels : PpmValueConfiguration,
                                    ppm_channels_offset : PpmValueConfiguration,
                                    ppm_width : number,
                                    ppm_width_max : number,
                                    ppm_channel_min_width : number)
{
   if(ppm_meters == 0)
   {
      return null;
   }

   let ppms : any = get_default_ppms(ppm_meters);
   if(existing_ppms != null)
   {
      ppms.alignment = existing_ppms.alignment;
   }
   ppms.width                  = ppm_width;
   ppms.width_max              = ppm_width_max;
   ppms.channel_min_width      = ppm_channel_min_width;

   for(let i = 0; i < ppm_meters;i++)
   {
      if(existing_ppms != null)
      {
         // Preserve visual tuning from the source style while replacing only the
         // channel mapping requested by cluster.ts.
         copy_ppm_cell_style(ppms.cells[i],existing_ppms.cells[Math.min(i,existing_ppms.cells.length - 1)]);
      }
      ppms.cells[i].channels_offset = get_ppm_value(ppm_channels_offset,i);
      ppms.cells[i].channels_num    = get_ppm_value(ppm_channels,i);
   }

   return ppms;
}

function configure_ppms(pip_configuration : any,
                        ppm_meters_left : number,
                        ppm_channels_left : PpmValueConfiguration,
                        ppm_channels_offset_left : PpmValueConfiguration,
                        ppm_meters_right : number,
                        ppm_channels_right : PpmValueConfiguration,
                        ppm_channels_offset_right : PpmValueConfiguration,
                        ppm_width : number,
                        ppm_width_max : number,
                        ppm_channel_min_width : number)
{
   validate_ppm_parameters(ppm_meters_left,ppm_channels_left,ppm_channels_offset_left,ppm_width,ppm_width_max,ppm_channel_min_width,'PPM left');
   validate_ppm_parameters(ppm_meters_right,ppm_channels_right,ppm_channels_offset_right,ppm_width,ppm_width_max,ppm_channel_min_width,'PPM right');

   pip_configuration.ppms_left  = build_ppms_from_parameters(pip_configuration.ppms_left,
                                                             ppm_meters_left,
                                                             ppm_channels_left,
                                                             ppm_channels_offset_left,
                                                             ppm_width,
                                                             ppm_width_max,
                                                             ppm_channel_min_width);
   pip_configuration.ppms_right = build_ppms_from_parameters(pip_configuration.ppms_right,
                                                             ppm_meters_right,
                                                             ppm_channels_right,
                                                             ppm_channels_offset_right,
                                                             ppm_width,
                                                             ppm_width_max,
                                                             ppm_channel_min_width);
}


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
      //
      // standard_layouts_enable generates the regular grid families:
      // 1-way, 4-way, 9-way, 12-way, 16-way, 25-way, etc.
      //
      // layouts_enable generates the asymmetric/featured layouts:
      // 6-way, 7-way, 8-way, 10-way, 13-way variants.
      //
      // remote/director/vt_coord are specialized layout families and are disabled
      // here unless explicitly needed.
      for(let i = 0; i < LAYOUTS_CONFIGS_NUM;i++)
      {
         parameters.pip_configurations[i].standard_layouts_enable                       = true;                                       
         parameters.pip_configurations[i].layouts_enable                                = true;
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
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_ID].enable               = true; // UMD + Audio Meters outside
         
         // Disable Tally versions to save clutter if not needed
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_TALLY_ID].enable             = false;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].enable         = false;
         
         // Enable "Inside" styles (Overlay)
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_ID].enable                    = false; // UMD inside video
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_ID].enable                = true; // UMD + Audio Meters inside
         
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_TALLY_ID].enable              = false;
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].enable          = false;
         
         // Disable User Custom slots by default
         parameters.pip_configurations[USER_0_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_1_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_2_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_3_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_4_LAYOUTS_ID].enable                        = false; // The custom one defined above is OFF here
      }

      // 5. PPM audio meter channel mapping
      //
      // ppm_meters_left/right controls how many PPM widgets are generated on each
      // side of every PIP. This is the argument passed to get_default_ppms().
      //
      // ppm_channels_left/right controls how many audio channels each PPM widget
      // displays. ppm_channels_offset_left/right controls which channel each
      // widget starts from.
      //
      // Use a single number when all widgets on that side should use the same
      // value, e.g. ppm_meters_left = 2 and ppm_channels_left = 4 creates two
      // left-side PPM widgets, each displaying 4 channels.
      //
      // Use arrays for per-widget control. For example:
      //   ppm_meters_left          = 2;
      //   ppm_channels_left        = [2,2];
      //   ppm_channels_offset_left = [0,2];
      //
      // This creates two left-side PPM widgets:
      //   widget 0: channels 0-1
      //   widget 1: channels 2-3
      //
      // PPM width is adaptive:
      //   ppm_width is the normal side width as a fraction of the PIP width.
      //   ppm_width_max is the largest side width the adaptive sizing may use.
      //   ppm_channel_min_width is the target minimum pixel width per audio channel.
      //
      // The generator keeps ppm_width for large PIPs, but increases up to
      // ppm_width_max when dense layouts would otherwise make the meters too narrow.
      {
         // Choose one of:
         //   'split_16ch'     : left shows channels 0-7, right shows channels 8-15.
         //   'mirrored_8ch'   : left and right both show channels 0-7.
         //   'quad_4ch_zero'  : two meters per side, each showing channels 0-3.
         let ppm_preset : PpmPreset = 'split_16ch';

         let ppm_meters_left             = 1;
         let ppm_channels_left           = 8;
         let ppm_channels_offset_left    = 0;

         let ppm_meters_right            = 1;
         let ppm_channels_right          = 8;
         let ppm_channels_offset_right   = 8;

         switch(ppm_preset as string)
         {
            case 'split_16ch':
            {
               ppm_meters_left             = 1;
               ppm_channels_left           = 8;
               ppm_channels_offset_left    = 0;
               ppm_meters_right            = 1;
               ppm_channels_right          = 8;
               ppm_channels_offset_right   = 8;
               break;
            }
            case 'mirrored_8ch':
            {
               ppm_meters_left             = 1;
               ppm_channels_left           = 8;
               ppm_channels_offset_left    = 0;
               ppm_meters_right            = 1;
               ppm_channels_right          = 8;
               ppm_channels_offset_right   = 0;
               break;
            }
            case 'quad_4ch_zero':
            {
               ppm_meters_left             = 2;
               ppm_channels_left           = 4;
               ppm_channels_offset_left    = 0;
               ppm_meters_right            = 2;
               ppm_channels_right          = 4;
               ppm_channels_offset_right   = 0;
               break;
            }
            default:
            {
               throw new Error(`Unknown PPM preset: ${ppm_preset}`);
            }
         }

         let ppm_width                   = 0.05;
         let ppm_width_max               = 0.09;
         let ppm_channel_min_width       = 4;

         configure_ppms(parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_ID],
                        ppm_meters_left,
                        ppm_channels_left,
                        ppm_channels_offset_left,
                        ppm_meters_right,
                        ppm_channels_right,
                        ppm_channels_offset_right,
                        ppm_width,
                        ppm_width_max,
                        ppm_channel_min_width);

         configure_ppms(parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID],
                        ppm_meters_left,
                        ppm_channels_left,
                        ppm_channels_offset_left,
                        ppm_meters_right,
                        ppm_channels_right,
                        ppm_channels_offset_right,
                        ppm_width,
                        ppm_width_max,
                        ppm_channel_min_width);

         configure_ppms(parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_ID],
                        ppm_meters_left,
                        ppm_channels_left,
                        ppm_channels_offset_left,
                        ppm_meters_right,
                        ppm_channels_right,
                        ppm_channels_offset_right,
                        ppm_width,
                        ppm_width_max,
                        ppm_channel_min_width);

         configure_ppms(parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID],
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
      
      // 6. Configure Rasters (Canvas Sizes)
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
      
      // 7. Execute Generation
      // Calls the library function to convert the `parameters` object into an array of Layout Objects.
      let layouts                   = generate_all_layouts(parameters);
      
      // (Optional) External Riot Games Layouts
      /*{
         get_proviews_valorant('https://stream.v4.controller.barracks.gg/...',0,layouts);
      }*/

      // 8. Add generated layouts to the result
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
                  video_inputs_max_num                    : 64,
                  audio_inputs_max_num                    : 64*4,
                  metadata_inputs_max_num                 : 1,
                  
                  // Define how many audio and metadata streams exist per video. 1 is normally for single 2110-30 16-channel audio streams. 2 would be when there are 2 x 2110-30 8-channel streams for each video
                  audio_inputs_per_video_input_max_num    : 4,
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
