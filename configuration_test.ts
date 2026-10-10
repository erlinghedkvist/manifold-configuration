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
        get_default_md}   from './layouts_default';
import {generate_northpoint_layouts} from './layouts_northpoint.ts';
import {services_test_routing}                                                                                            from './manifold_cloud_api_routing.js';
import {services_test_tally_and_labels}                                                                                   from './manifold_cloud_api_tally_labels.js';
import * as fs from 'fs/promises';
import * as path from 'path';

function get_layouts()
{
  //let layouts = generate_northpoint_layouts();
  
  //console.log('layouts:',JSON.stringify(layouts, null, 2));   
  //return generate_northpoint_layouts();
  
	let parameters        = generate_layouts_parameters();
      //which layouts families to include
      for(let i = 0; i < LAYOUTS_CONFIGS_NUM;i++)
      {
         parameters.pip_configurations[i].standard_layouts_enable                       = true;
         parameters.pip_configurations[i].layouts_enable                                = true;
         parameters.pip_configurations[i].remote_layouts_enable                         = true;
         parameters.pip_configurations[i].director_layouts_enable                       = true;
         parameters.pip_configurations[i].vt_coord_layouts_enable                       = true;
         parameters.pip_configurations[i].big_layouts_enable                            = true;
         parameters.pip_configurations[i].riot_layouts_enable                           = true;
      }

       //example how to derive and customize layouts
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
         //
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].video_source.alarms_enable                                   = true;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].video_source.alarms_on_video_source_not_assigned_show_logo   = true;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_left.cells[0].channels_offset          = 0;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_left.cells[0].channels_num             = 8;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_right.cells[0].channels_offset         = 8;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_right.cells[0].channels_num            = 8;

      }

      //how pips look ?
      {
         parameters.pip_configurations[DEFAULT_LAYOUTS_ID].enable                       = true;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_ID].enable                   = false;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_ID].enable               = false;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_TALLY_ID].enable             = false;
         parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].enable         = true;
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_ID].enable                    = false;
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_ID].enable                = false;
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_TALLY_ID].enable              = false;
         parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].enable          = true;
         parameters.pip_configurations[USER_0_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_1_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_2_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_3_LAYOUTS_ID].enable                        = false;
         parameters.pip_configurations[USER_4_LAYOUTS_ID].enable                        = false;

      }
      //1920x1080 raster
      {
         parameters.raster_configurations[RASTER_1920x1080_ID].enable                   = true;
         parameters.raster_configurations[RASTER_1920x1080_ID].layout_style_bgnd_color  = 'black';//'magenta';
      }
      //3840x2160 raster
      {
         parameters.raster_configurations[RASTER_3840x2160_ID].enable                   = false;
         parameters.raster_configurations[RASTER_3840x2160_ID].layout_style_bgnd_color  = 'black';//'black';
      }
      let layouts                   = generate_all_layouts(parameters);
      return layouts;		
      
}

function get_services()
{ 
  let  services = <any>[];

  let child_id = 0;

  //Video Test Generator
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
            video_raster_id                    : '7680x4320',//(i==0)?'1920x1080':'1280x720',
            video_refresh_rate_id              : 'p120Hz',//(i==0)?'i59.94Hz':'p50Hz',//:'p59.94Hz',
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
            ip_addresses_range_id              : (i<32)?2:3,
            output_stream_enable               : true
        }
      ]
      };
      services[child_id++] = video_testgen;
    }
  //Multiviewers
  for(let i = 0; i < 1;i++)
  {               
                                       
    let multiviewer_head = {
      db_schema         : 'video',   
      db_table          : 'multiviewer_heads',         
      db_table_records   : [
              {                 
                //user_afu_id                             : 1,//heads_description[i].user_afu_id,//comment out for auto load balance                  
                //name                                    : heads_description[i].name,//`Head ${i}`,
                name                                    : `Head ${i}`,
                video_inputs_max_num                    : 64,
                audio_inputs_max_num                    : 64,
                metadata_inputs_max_num                 : 1,
                audio_inputs_per_video_input_max_num    : 1,
                metadata_inputs_per_video_input_max_num : 1,
                display_mode                            : 'on',                                           
                video_raster_id                         : '1920x1080',//'3840x2160',
                video_refresh_rate_id                   : 'p50Hz',//'p59.94Hz',                                
                layout_id                               : 1+i,//86,//5,//6,                                                
                ip_addresses_range_id                   : 4
             }
      ]
    };                                              
    services[child_id++] = multiviewer_head;       
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
      lut = { 
              title    : nameWithoutExt,
              lut_data : fileContent
            };      
      luts[child_id++] = lut;               
    }
  }

  return luts;
}

const api = new ManifoldCloudAPI('http://127.0.0.1/v1/manifold/');
//const api = new ManifoldCloudAPI('http://172.16.218.169/v1/manifold/');


async function run() {
    
    try {
       
        await api.login('admin', 'password');  
        //console.log('Logged in, token:', api.getToken());

        cloud_configuration_payload_filter : JSON;        
        cloud_configuration_payload_filter = 
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
	                
        cloud_configuration_payload : JSON;
        cloud_configuration_payload =  
          {            
            nodes : [
              {
                name        : "Bittware 1402B - 0",
                ctrl_ipaddr : "127.0.0.2",
                accelerators:
                [
                    {accelerator_type : "prodesign:FALCON-Stratix",on_node_id : 0},
                    {accelerator_type : "prodesign:FALCON-Stratix",on_node_id : 1},
                   // {accelerator_type : "Bittware:520N-MX",on_node_id : 2},
                   // {accelerator_type : "Bittware:520N-MX",on_node_id : 3}
                ]
              }
            ],

            licenses : [ { "name":"license key 1",
                           "token" : "eyJhbGciOiJQUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MTE1OTQ2MzYsImlhdCI6MTc4MDAzNzY4NCwibWFuaWZvbGQtY2xvdWQtY2hpcC1pZHMiOiJbXCIweDY4NzY2OThBMTE3NjUxNUJcIixcIjB4Njg3NzBGOEE3RDhEQ0Q3MVwiXSIsIm1hbmlmb2xkLWNsb3VkLXBvaW50cyI6IjEyNjAiLCJtYW5pZm9sZC1jbG91ZC1zeXN0ZW0taWRzIjoiW1wiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwXCJdIiwibWFuaWZvbGQtY2xvdWQtdXBkYXRlcy1lbmFibGUiOiJ0cnVlIn0.MnBsWWZHHABFAgN_9Spl35dn-J0s4O1RYLlQdyenYzEDunX-6w4292Pzkb3yzwaHYuERcaGXlsOAnEicEuJ3lP4q8wlggflemiiaQn9PMlEvwZ9YmDWOVSVBm7wQ-my_-s1hMbRgVp5ETHFhyb3fYt3c4XGs73Ek96m7paLnaexvDF6Q25Cd3FzxfhBRSy8cEUZv0Qj2rPV12Bo8I3ExVVdLK0JO1mXYtU6sveachnHlDSli-LSwNHCewabphRXJzaKrEi1qZScX4R93AjHLrQyMUfbTrIM7UdmO7Q3ripqrPnLoR9BKHGhGn9tIdaYk_oVSMVIeZInWNSNcndJ_m6wm-TQwgKI82kM26rK8Bwd6BI9UYTyCMZ8DTCvtlPqNI-buy1hrC8yPlSnRp2ljNECV9fMKrbMCWh1zzREN7EdvGasZYELEdb6IXpFLUVmQtDdpEpd7M9MQz8_3xd9Bo7_ggtHPeT7_aWhHjUVRbE9bIcFYyvc7Tnqn1BNrVohhQIZcgV2hACZLE31EHx3y1Gh4UapuPwFsI4cKtqdsM5SXXhQ4wltJYpgasZj8h80-pXkjxgjHY_blzRhMkH3OhP-qMvTa8bmwDyp7_3dzCebLD2YUCIJWuUdeWWGeTXBjITxIDxC_a5CZqNQFmBtxFY1vRkezzRrlbSTJ6Lrv9e8"} ],

	          layouts :  get_layouts(),		

            luts3D   : await get_luts3D(),

            clusters : [
              {
                cluster : 
                { "name"                                        :"Manifold Test Cluster",
                  // manual uuid
                  "id_uuid"                                    : "92070b3c-5a7c-11f1-a4cc-0f76e58751a5", 
                  //ports mac address
                  "network_ports_mac_address_assignment_mode"   : 'auto',//'manual',                     
                  "network_ports_auto_mac_address_start"        :"00:50:c2:f6:cb:00",
                  "network_ports_auto_mac_address_inc"          : 1,             
                  //ports ip address  
                  "network_ports_address_assignment_mode"      : 'auto',//'manual',                  
                  "network_ports_auto_ip_address_start"        :"10.40.0.16",
                  "network_ports_auto_ip_address_num"          : 16,
                  //
                  "clear_unused_sources"                      : true,
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
                  "tsl_udp_port"                              : 8800,
                  "tsl_tcp_port"                              : 8801,
                  //plura
                  "plura_timers"                              : ["172.16.0.231"],								       
                  //NMOS
                  "nmos_registry_url"                         : "http://172.16.0.79:30010",
                  "nmos_advertised_hosts"                     : ["172.16.209.73"]
                },            

                accelerators_ports_addresses : [                                                                        
                  {mac_address : "00:50:c2:f6:00:00",ip_address : "10.151.1.41"},
                  {mac_address : "00:50:c2:f6:00:01",ip_address : "10.151.2.41"},
                  {mac_address : "00:50:c2:f6:00:02",ip_address : "10.151.1.43"},
                  {mac_address : "00:50:c2:f6:00:03",ip_address : "10.151.2.43"},
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

                accelerators : [         
                  //{ accelerator_server : {name : "manifold400g"}}         
                  //{ node : {name : "FALCON-NEST - 0",accelerators : [0]}}                  
                  { node_name : "Bittware 1402B - 0"}                 
                ],

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
                services : get_services(),                
              }
            ]
          };         
          ///console.log('cloud_configuration:', cloud_configuration_payload);

          
        cloud_configuration : JSON;  
        cloud_configuration =
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


        const configuration_result = await api.post_and_wait('/configuration',cloud_configuration,180000);
        //services_test_routing(api,configuration);
        
        //services_test_tally_and_labels(api,configuration);

        console.log('configuration result:',configuration_result);
                                        

    } catch (err: any) {
      console.error('API Error:', err.message);
    }
  }
  
  run();

