import ManifoldCloudAPI from './manifold_cloud_api.js';
import {generate_layouts_parameters,generate_all_layouts}                                                                  from './layouts_default';
import {RASTER_1280x720_ID,RASTER_1920x1080_ID,RASTER_3840x2160_ID}                                                        from './layouts_default';
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
        configure_default_ppm_layouts}   from './layouts_default';
//import {services_test_routing}                                                                                            from './manifold_cloud_api_routing.js';
// import {services_test_tally_and_labels}                                                                                   from './manifold_cloud_api_tally_labels.js';

function get_layouts()
{
  let parameters        = generate_layouts_parameters();
      //which layouts families to include
      if (!parameters?.pip_configurations || !parameters?.raster_configurations) {
        throw new Error('Parameters initialization failed');
      }
      const pip_configs = parameters.pip_configurations! as any;
      const raster_configs = parameters.raster_configurations! as any;
      for(let i = 0; i < LAYOUTS_CONFIGS_NUM;i++)
      {
         pip_configs[i].standard_layouts_enable                       = true;//true;
         pip_configs[i].layouts_enable                                = true;//true;
         pip_configs[i].remote_layouts_enable                         = false;
         pip_configs[i].director_layouts_enable                       = false;
         pip_configs[i].vt_coord_layouts_enable                       = false;
         pip_configs[i].big_layouts_enable                            = true;//true;
         pip_configs[i].riot_layouts_enable                           = true;//true;
      }

       //example how to derive and customize layouts
       {
         pip_configs[USER_0_LAYOUTS_ID]                                    = clone(pip_configs[OUTSIDE_LAYOUTS_UMD_ID]);
         pip_configs[USER_0_LAYOUTS_ID].name                               = 'outside (umd dual)';
         pip_configs[USER_0_LAYOUTS_ID].video_source.style_border_width    = 2*0;
         pip_configs[USER_0_LAYOUTS_ID].umd                                = get_default_md(2);
         pip_configs[USER_0_LAYOUTS_ID].umd.alignment                      = 'outside';
         pip_configs[USER_0_LAYOUTS_ID].umd.width                          = 1.0;
         pip_configs[USER_0_LAYOUTS_ID].umd.cells[0].mode                  = 'parent_video_source_standard',
         pip_configs[USER_0_LAYOUTS_ID].umd.cells[0].width                 = 0.4;
         pip_configs[USER_0_LAYOUTS_ID].umd.cells[0].style_border_width    = 1;
         pip_configs[USER_0_LAYOUTS_ID].umd.cells[1].mode                  = 'parent_video_source_name',
         pip_configs[USER_0_LAYOUTS_ID].umd.cells[1].width                 = 0.6;
         pip_configs[USER_0_LAYOUTS_ID].umd.cells[1].style_border_width    = 1;
         //
         pip_configs[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].video_source.alarms_enable                                   = true;
         pip_configs[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].video_source.alarms_on_video_source_not_assigned_show_logo   = true;

      }

      // PPM audio meter channel mapping
      {
         type PpmConfigurationMode = 'preset' | 'manual';
         type PpmPreset = 'split_16ch' | 'mirrored_8ch' | 'quad_4ch_zero';

         let ppm_configuration_mode : PpmConfigurationMode = 'preset';
         let ppm_preset             : PpmPreset            = 'mirrored_8ch';

         let ppm_meters_left             = 1;
         let ppm_channels_left           = 8;
         let ppm_channels_offset_left    = 0;
         let ppm_meters_right            = 1;
         let ppm_channels_right          = 8;
         let ppm_channels_offset_right   = 8;

         if(ppm_configuration_mode == 'preset')
         {
            switch(ppm_preset as string)
            {
               case 'split_16ch':
                  ppm_channels_offset_right = 8;
                  break;
               case 'mirrored_8ch':
                  ppm_channels_offset_right = 0;
                  break;
               case 'quad_4ch_zero':
                  ppm_meters_left = 2;
                  ppm_channels_left = 4;
                  ppm_meters_right = 2;
                  ppm_channels_right = 4;
                  ppm_channels_offset_right = 0;
                  break;
               default:
                  throw new Error(`Unknown PPM preset: ${ppm_preset}`);
            }
         }

         configure_default_ppm_layouts(parameters,
                                       ppm_meters_left,
                                       ppm_channels_left,
                                       ppm_channels_offset_left,
                                       ppm_meters_right,
                                       ppm_channels_right,
                                       ppm_channels_offset_right,
                                       0.05,
                                       0.09,
                                       4);
      }

      //how pips look ?
      {
         pip_configs[DEFAULT_LAYOUTS_ID].enable                       = true;
         pip_configs[OUTSIDE_LAYOUTS_UMD_ID].enable                   = false;
         pip_configs[OUTSIDE_LAYOUTS_UMD_PPM_ID].enable               = true;
         pip_configs[OUTSIDE_LAYOUTS_UMD_TALLY_ID].enable             = false;
         pip_configs[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].enable         = true;
         pip_configs[INSIDE_LAYOUTS_UMD_ID].enable                    = false;
         pip_configs[INSIDE_LAYOUTS_UMD_PPM_ID].enable                = true;
         pip_configs[INSIDE_LAYOUTS_UMD_TALLY_ID].enable              = false;
         pip_configs[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].enable          = false;
         pip_configs[USER_0_LAYOUTS_ID].enable                        = false;
         pip_configs[USER_1_LAYOUTS_ID].enable                        = false;
         pip_configs[USER_2_LAYOUTS_ID].enable                        = false;
         pip_configs[USER_3_LAYOUTS_ID].enable                        = false;
         pip_configs[USER_4_LAYOUTS_ID].enable                        = false;

      }
      //1920x1080 raster
      {
         raster_configs[RASTER_1920x1080_ID].enable                   = true;
         raster_configs[RASTER_1920x1080_ID].layout_style_bgnd_color  = 'black';//'magenta';
      }
      //3840x2160 raster
      {
         raster_configs[RASTER_3840x2160_ID].enable                   = true;
         raster_configs[RASTER_3840x2160_ID].layout_style_bgnd_color  = 'black';//'black';
      }
      let layouts                   = generate_all_layouts(parameters!);
      return layouts;		
}

function get_services()
{ 
  let  services = <any>[];

  let child_id = 0;


  //Multiviewers
  
//video_raster_id '720x486','720x576','1280x720','1920x1035','1920x1080','2048x1080','3840x2160','4096x2160','7680x4320','8192x4320';
   //video_refresh_rate_id as enum ('p23.98Hz','sF23.98Hz','p24Hz','sF24Hz','p25Hz','sF25Hz','p29.97Hz','sF29.97Hz','p30Hz','sF30Hz',
   //                               'p47.95Hz','i47.95Hz','p48Hz','i48Hz','p50Hz','i50Hz','p59.94Hz','i59.94Hz','p60Hz','i60Hz','p100Hz','p119.88Hz','p120Hz');

   
   let multiviewer_head = [
   {id : 0,  name : 'Head-0',     video_raster_id :'1920x1080',video_refresh_rate_id : 'p50Hz',user_afu_id : 1,layout_id : 1,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
   {id : 1,  name : 'Head-1',     video_raster_id :'1920x1080',video_refresh_rate_id : 'p50Hz',user_afu_id : 1,layout_id : 1,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
   {id : 2,  name : 'Head-2',     video_raster_id :'1920x1080',video_refresh_rate_id : 'p50Hz',user_afu_id : 1,layout_id : 1,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
   {id : 3,  name : 'Head-3',     video_raster_id :'1920x1080',video_refresh_rate_id : 'p50Hz',user_afu_id : 2,layout_id : 1,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
   {id : 4,  name : 'Head-4',     video_raster_id :'1920x1080',video_refresh_rate_id : 'p50Hz',user_afu_id : 2,layout_id : 1,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
   {id : 5,  name : 'Head-5',     video_raster_id :'1920x1080',video_refresh_rate_id : 'p50Hz',user_afu_id : 2,layout_id : 1,video_inputs_max_num : 64,audio_inputs_max_num : 64,metadata_inputs_max_num : 1},
   ];

    for(let i = 0; i < multiviewer_head.length;i++)
      {                                         	   
         let head = {
            db_schema         : 'video',   
            db_table          : 'multiviewer_heads',         
            db_table_records   : [
               {                 
                //user_afu_id                             : user_afu_id,                 
                name                                    : heads_description[i].name,
                video_inputs_max_num                    : multiviewer_head[i].video_inputs_max_num,
                audio_inputs_max_num                    : multiviewer_head[i].audio_inputs_max_num,
                metadata_inputs_max_num                 : multiviewer_head[i].metadata_inputs_max_num,
                audio_inputs_per_video_input_max_num    : 1,
                metadata_inputs_per_video_input_max_num : 1,
                display_mode                            : 'on',                                           
                video_raster_id                         : multiviewer_head[i].video_raster_id,
                video_refresh_rate_id                   : multiviewer_head[i].video_refresh_rate_id,                               
                layout_id                               : multiviewer_head[i].layout_id,                                        
                ip_addresses_range_id                   : 4,
                video_tcs                               : 'SDR',
                extra_time_offset                       : 0
             }
      ]
    };                                              
    services[child_id++] = head;       
  }  
  //UDX
  for(let i = 0; i < 0;i++)
  {     
    let udx = {
      db_schema                                : 'video',
      db_table                                 : 'udxs',
      db_table_records                         :
      [
        {
            name                               : `UDX ${i}`,
            //video standard
            video_raster_id                    : '1920x1080',
            video_refresh_rate_id              : 'i50Hz',//'i59.94Hz',
            //
            ip_addresses_range_id              : 4
        }
      ]
    };
    services[child_id++] = udx;
  }

  return services;
}

const api = new ManifoldCloudAPI('http://127.0.0.1/v1/manifold/');

async function run() {
    
    try {
       
        await api.login('admin', 'password');  
        console.log('Logged in, token:', api.getToken());
                  
        const cloud_configuration_payload =  
          {
            accelerators_servers : [              
              { name            : "FALCON-NEST - 0", accelerators : [{type : "prodesign:FALCON-Stratix",num : 1}]},
            ],

             licenses : [ { "name"	:"license key 1",
                           "token" 	:""} 
			],      
      
            layouts :  get_layouts(),		

            clusters : [
              {
                cluster : 
                { "name"                                        :"manifold cluster 1",
                  // manual uuid
                  "id_uuid"                                    : "04b182d2-afa5-4a50-8411-6eee447958ea", 
                  //ports mac address
                  "network_ports_mac_address_assignment_mode"   : 'auto',//'manual',                     
                  "network_ports_auto_mac_address_start"        :"00:50:c2:f6:cb:b5",
                  "network_ports_auto_mac_address_inc"          : 1,             
                  //ports ip address  
                  "network_ports_address_assignment_mode"      : 'manual',//'auto',                  
                  "network_ports_auto_ip_address_start"        :"10.30.0.2",
                  "network_ports_auto_ip_address_num"          : 16,
                  //
               
                  //routing mode
                  "ingress_sources_routing_mode"              : 'sps',//'sps',//'afu port 0',//'auto',//'afu port 1'                                                                          
                  "clear_unused_sources"                      : true,   
                  //ptp sync settings
                  "ptp_enable"                                : true,
                  "ptp_domain_number"                         : 127,                                                                          
                  //protocols configuration
                  //ember                                                                    
                  "ember_port"                                : 9000,
                  //tsl(v5)                      
                  "tsl_connections_num"                       : 1,
                  "tsl_screens_per_connection"                : 65535,
                  "tsl_udp_port"                              : 30500,
                  "tsl_tcp_port"                              : 8801,
                  //plura
                  //"plura_timers"                              : ["172.16.0.231"],								       
                  //NMOS
                  "nmos_registry_url"                         : "http://172.16.0.79:30010",
                  "nmos_advertised_hosts"                     : ["172.16.0.120"]
                },            

                accelerators_ports_addresses : [                                                                        
                  {mac_address : "00:50:c2:f6:00:00",ip_address : "10.101.1.1"},
                  {mac_address : "00:50:c2:f6:00:01",ip_address : "10.101.1.5"},
                  {mac_address : "00:50:c2:f6:00:02",ip_address : "10.101.1.9"},
                  {mac_address : "00:50:c2:f6:00:03",ip_address : "10.101.1.13"}/*,
                  {mac_address : "00:50:c2:f6:00:04",ip_address : "10.60.10.12"},
                  {mac_address : "00:50:c2:f6:00:05",ip_address : "10.70.10.12"},
                  {mac_address : "00:50:c2:f6:00:06",ip_address : "10.60.10.13"},
                  {mac_address : "00:50:c2:f6:00:07",ip_address : "10.70.10.13"},                                                                        
                  {mac_address : "00:50:c2:f6:00:08",ip_address : "10.151.1.49"},
                  {mac_address : "00:50:c2:f6:00:09",ip_address : "10.151.2.49"},
                  {mac_address : "00:50:c2:f6:00:10",ip_address : "10.151.1.51"},
                  {mac_address : "00:50:c2:f6:00:11",ip_address : "10.151.2.51"},
                  {mac_address : "00:50:c2:f6:00:12",ip_address : "10.151.1.53"},
                  {mac_address : "00:50:c2:f6:00:13",ip_address : "10.151.2.53"},
                  {mac_address : "00:50:c2:f6:00:14",ip_address : "10.151.1.55"},
                  {mac_address : "00:50:c2:f6:00:15",ip_address : "10.151.2.55"}*/
                ],

                accelerators : [                  
                  { accelerator_server : {name : "FALCON-NEST - 0"}},	  
    ],

                services_ip_addresses_ranges : [                                                                                         
                  {"name":"RL Generators IP Range","ip_addresses_start":'238.90.24.0',"ip_addresses_num":8192,"inc_mode":'X_X_1_1',"sources_routing_mode":'sps',udp_src_port: 9000,udp_dst_port : 9000,rtp_payload_type : 96},
                  {"name":"RL Generators IP Range","ip_addresses_start":'238.91.24.0',"ip_addresses_num":8192,"inc_mode":'X_X_1_1',"sources_routing_mode":'sps',udp_src_port: 9000,udp_dst_port : 9000,rtp_payload_type : 96},                                   
                  {"name":"Video Test Patterns IP Range Primary","ip_addresses_start":'238.90.20.0',"ip_addresses_num":1024,"inc_mode":'X_X_1_1',"sources_routing_mode":'sps',udp_src_port: 9000,udp_dst_port : 9000,rtp_payload_type : 96},
                  {"name":"Video Test Patterns IP Range Secondary","ip_addresses_start":'238.91.20.0',"ip_addresses_num":1024,"inc_mode":'X_X_1_1',"sources_routing_mode":'sps',udp_src_port: 9000,udp_dst_port : 9000,rtp_payload_type : 96},                                                                                                                                             
                  {"name":"Multiviewer Heads IP Range Primary","ip_addresses_start":'238.90.16.0',"ip_addresses_num":1024,"inc_mode":'X_X_1_1',"sources_routing_mode":'sps',udp_src_port: 9000,udp_dst_port : 9000,rtp_payload_type : 96},
                  {"name":"Multiviewer Heads IP Range Secondary","ip_addresses_start":'238.91.16.0',"ip_addresses_num":1024,"inc_mode":'X_X_1_1',"sources_routing_mode":'sps',udp_src_port: 9000,udp_dst_port : 9000,rtp_payload_type : 96}      
                ],
                
                services : get_services()
              }
            ]
          };         
                
          //console.log('cloud_configuration:', cloud_configuration);

        const cloud_configuration: any =
        {         
	  //filter  : null,
          payload : cloud_configuration_payload
        } ; 


        const payload = JSON.stringify(cloud_configuration);  
        console.log(`Content-Length: ${Buffer.byteLength(payload)} bytes`);
        
	const configuration = await api.post('/configuration',cloud_configuration);
        //services_test_routing(api,configuration);
        
        //services_test_tally_and_labels(api,configuration);

        //console.log('configuration result:',configuration);
                                        

    } catch (err: any) {
      console.error('API Error:', err.message);
    }
  }
  
  run();
