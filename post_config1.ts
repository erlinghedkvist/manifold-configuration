import {username,password}      from './lib/login';
import {login,read,update,execute_cmd,t_callback}  from './lib/utils';
//-----------------------------------------------

function patch_result(result : any)
{           
    //console.log("patch_result");
    //console.log(result);
}


function change_value_result(result : any)
{
    //console.log(result);
}
let source_id = 0;


function get_video_tp_sdp(id : number)
{   
    
    let max_channels = 32;
    let tmp_id = id%max_channels;

    let afu_id      = id%2;
    let afu_port_id = id;
    let port_id     = 0;//afu_id*2 + afu_port_id;
  
    let sdp = `v=0
        o=- 0 1 IN IP4 172.16.210.110
        s=TP #${id}
        i=tp #${id}
        t=0 0
        a=group:DUP primary secondary
        m=video 9000 RTP/AVP 97
        c=IN IP4 239.90.20.${id}/64
        a=source-filter: incl IN IP4 239.90.20.${id} 172.16.210.${port_id}
        a=rtpmap:97 raw/90000
        a=fmtp:97 SSN=ST2110-20:2017; TP=2110TPN; depth=10; sampling=YCbCr-4:2:2; TCS=UNSPECIFIED; PM=2110GPM; colorimetry=BT709; range=NARROW; width=1920; height=1080; exactframerate=60; 
        a=mediaclk:direct=0
        a=ts-refclk:localmac=C0-F9-D2-01-01-9F
        a=mid:primary`;


    return sdp;
}

let total_sources = 16;//256*16;//32*2;

function getRandomInt(max : number) 
{
    return Math.floor(Math.random() * max);
}

function get_video_sdp_test()
{

let sdp = `v=0
    o=- 0 1 IN IP4 172.16.233.0
    s=AT300-233-Dirk-01: RTP Transmitter Session #0
    i=Session by VM via RTP Transmitter Session #0
    t=0 0
    a=group:DUP primary secondary
    m=video 9000 RTP/AVP 97
    c=IN IP4 239.0.233.0/64
    b=AS:1098000
    a=source-filter: incl IN IP4 239.0.233.0 172.16.233.0
    a=rtpmap:97 raw/90000
    a=fmtp:97 SSN=ST2110-20:2017; TP=2110TPN; depth=10; sampling=YCbCr-4:2:2; TCS=SDR; PM=2110GPM; colorimetry=BT709; range=NARROW; width=1920; height=1080; interlace; exactframerate=25;
    a=mediaclk:direct=0
    a=ts-refclk:localmac=C0-F9-D2-01-00-FD
    a=mid:primary
    m=video 9000 RTP/AVP 97
    c=IN IP4 239.0.233.1/64
    b=AS:1098000
    a=source-filter: incl IN IP4 239.0.233.1 172.16.233.1
    a=rtpmap:97 raw/90000
    a=fmtp:97 SSN=ST2110-20:2017; TP=2110TPN; depth=10; sampling=YCbCr-4:2:2; TCS=SDR; PM=2110GPM; colorimetry=BT709; range=NARROW; width=1920; height=1080; interlace; exactframerate=25;
    a=mediaclk:direct=0
    a=ts-refclk:localmac=C0-F9-D2-01-00-FE
    a=mid:secondary
    m=video 9000 RTP/AVP 100
    c=IN IP4 239.36.233.0/64
    a=source-filter: incl IN IP4 239.36.233.0 172.16.233.0
    a=rtpmap:100 smpte291/90000
    a=fmtp:100 width=1920; height=1080; interlace; exactframerate=25;
    a=mediaclk:direct=0
    a=ts-refclk:localmac=C0-F9-D2-01-00-FD
    a=mid:primary`;
    return sdp;
}




function get_video_sdp(id : number)
{   

    //let sdp = get_video_sdp_test();
    //return sdp;


    let current_source = (source_id%total_sources);
    source_id++;
    //source_id +=  getRandomInt(100);


/*

        let tmp_id_a = Math.floor(current_source%256);
        let tmp_id_b = Math.floor(current_source/256);

        let sdp = `v=0
        o=- 0 1 IN IP4 172.16.210.112
        s=SRC #${tmp_id_a} ${tmp_id_b}
        i=Session
        t=0 0
        a=group:DUP primary secondary
        m=video 9000 RTP/AVP 96
        c=IN IP4 239.30.${tmp_id_a}.${tmp_id_b}/64
        b=AS:2631000
        a=source-filter: incl IN IP4 239.30.${tmp_id_a}.${tmp_id_b} 172.16.30.10
        a=rtpmap:96 raw/90000
        a=fmtp:96 SSN=ST2110-20:2017; TP=2110TPN; depth=10; sampling=YCbCr-4:2:2; TCS=UNSPECIFIED; PM=2110GPM; colorimetry=BT709; range=NARROW; width=1920; height=1080; exactframerate=60000/1001; 
        a=mediaclk:direct=0
        a=ts-refclk:localmac=C0-F9-D2-01-07-57
        a=mid:primary `;    
        return sdp;
*/




       
    if(current_source < 32)
    {        
	let id = current_source;
        let sdp = `v=0
        o=- 0 1 IN IP4 172.16.210.110
        s=AT-300 RTP Transmitter Session #${id}
        i=Session by VM via RTP Transmitter Session #${id}
        t=0 0
        a=group:DUP primary secondary
        m=video 9000 RTP/AVP 97
        c=IN IP4 239.${id}.210.110/64
        b=AS:2631000
        a=source-filter: incl IN IP4 239.${id}.210.110 172.16.210.110
        a=rtpmap:97 raw/90000
        a=fmtp:97 SSN=ST2110-20:2017; TP=2110TPN; depth=10; sampling=YCbCr-4:2:2; TCS=UNSPECIFIED; PM=2110GPM; colorimetry=BT709; range=NARROW; width=1920; height=1080; exactframerate=50; 
        a=mediaclk:direct=0
        a=ts-refclk:localmac=C0-F9-D2-01-07-57
        a=mid:primary `;    
        return sdp;

    } /*else
    if(current_source < (32+32))
    {

	let id = current_source-32;
        let sdp = `v=0
        o=- 0 1 IN IP4 172.16.210.112
        s=AT-300-155: RTP Transmitter Session #${32+id}
        i=Session by VM via RTP Transmitter Session #${32+id}
        t=0 0
        a=group:DUP primary secondary
        m=video 9000 RTP/AVP 97
        c=IN IP4 239.${id}.22.0/64
        b=AS:2631000
        a=source-filter: incl IN IP4 239.${id}.22.0 172.16.30.20
        a=rtpmap:97 raw/90000
        a=fmtp:97 SSN=ST2110-20:2017; TP=2110TPN; depth=10; sampling=YCbCr-4:2:2; TCS=UNSPECIFIED; PM=2110GPM; colorimetry=BT709; range=NARROW; width=1920; height=1080; exactframerate=60000/1001; 
        a=mediaclk:direct=0
        a=ts-refclk:localmac=C0-F9-D2-01-07-57
        a=mid:primary `;    
        return sdp;
	
	//return  get_video_tp_sdp(current_source-17);
    }
*/    

    return  '';//get_video_tp_sdp(current_source-16);

}

function get_audio_sdp(id : number)
{
    
    let max_channels = 32;////2;
    let tmp_idd = Math.floor(id/2);//id%max_channels;
    let tmp_id  = Math.floor(tmp_idd%max_channels);
    
    let channels_num = 16;
    /*if(tmp_id == 2)
    {
        channels_num = 16;
    }*/
    //if(tmp_id < 2)

    console.log(`get_audio_sdp ${tmp_id}`);

    {

    let sdp = `v=0
        o=- 0 1 IN IP4 172.16.210.110
        s=AT300: RTP Transmitter Session #${tmp_id}
        i=Session by VM via RTP Transmitter Session #0
        t=0 0
        a=group:DUP primary secondary
        m=audio 9000 RTP/AVP 96
        c=IN IP4 239.${32+tmp_id}.210.110/64
        a=source-filter: incl IN IP4 239.${32+tmp_id}.210.110 172.16.210.110
        a=rtpmap:96 L24/48000/${channels_num}
        a=framecount:6
        a=ptime:0.125
        a=mediaclk:direct=0
        a=ts-refclk:localmac=C0-F9-D2-01-01-9F
        a=mid:primary`;

        return sdp;
    } /*else {

/*
        tmp_id = 0;

        let sdp = `v=0
        o=- 0 1 IN IP4 172.16.210.110
        s=AT300: RTP Transmitter Session #22
        i=Session by VM via RTP Transmitter Session #22
        t=0 0
        a=group:DUP primary secondary
        m=audio 9000 RTP/AVP 96
        c=IN IP4 239.${72+tmp_id}.210.110/64
        a=source-filter: incl IN IP4 239.${72+tmp_id}.210.110 172.16.210.110
        a=rtpmap:96 L24/48000/16
        a=framecount:6
        a=ptime:0.125
        a=mediaclk:direct=0
        a=ts-refclk:localmac=C0-F9-D2-01-01-9F
        a=mid:primary
        m=audio 9000 RTP/AVP 96
        c=IN IP4 239.${72+tmp_id}.210.111/64
        a=source-filter: incl IN IP4 239.${72+tmp_id}.210.111 172.16.210.111
        a=rtpmap:96 L24/48000/16
        a=framecount:6
        a=ptime:0.125
        a=mediaclk:direct=0
        a=ts-refclk:localmac=C0-F9-D2-01-01-A0
        a=mid:secondary`;
    
        return sdp;    
*/        
/*           
    }
*/

}


async function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

let blind = false;
function patch_sdp(processing_object_id : number,on_processing_object_id : number, type : string)
{
    
    let tmpsdp                     = (type == 'video') ? get_video_sdp(on_processing_object_id) : get_audio_sdp(on_processing_object_id);
    
    if (blind) 
    {
        //tmpsdp = '';
    }

    let db_schema               = "processing_objects";
    let db_request              = `inputs?on_processing_object_id=eq.${on_processing_object_id}&processing_object_id=eq.${processing_object_id}&signal_type=eq.${type}`; 
    let db_table_record         = {
       sdp : tmpsdp
    };
    let db_table_record_str  = JSON.stringify(db_table_record);
    
    //console.log(`${db_request} ${db_table_record_str}`);
    
    update(db_schema,db_request,db_table_record_str,change_value_result);
    

   //console.log('-------------------------'+source_id);

   //console.log(tmpsdp);

   //console.log(`${db_request} ${db_table_record_str}`);
	
}

function patch_label(screen_id : number,on_screen_id : number, label : string)
{
    let db_schema               = "video";
    let db_request              = `multiviewer_head_tally_and_labels?screen_id=eq.${screen_id}&on_screen_id=eq.${on_screen_id}`;
    let db_table_record         = {
        tally_label : label
     };

    let db_table_record_str  = JSON.stringify(db_table_record);
    
    //console.log(`${db_request} ${db_table_record_str}`);
    
    update(db_schema,db_request,db_table_record_str,change_value_result);
}   



let C_HEADS_NUM            = 1;//40;
let C_VIDEO_CHANNELS_NUM   = 0;//16;////38;//34;//16;
let C_AUDIO_CHANNELS_NUM   = 16;//16;
let h_id                   = 0;

async function head_result(result : any)
{
    //console.log("--------------------------------------------------");
    //console.log(result);

    //reset for each head
    //source_id = 0;    

    console.log("head_result head_id = " + h_id);

    //patch video
    if(result.result_value.length > 0)
    {
        for(let video_channel_id = 0; video_channel_id < C_VIDEO_CHANNELS_NUM;video_channel_id++)
        {        
            //console.log("video_channel_id = " + video_channel_id);
            patch_sdp(result.result_value[0].processing_object_id,video_channel_id,'video');

            //let head_id = result.payload_value;
            //let label = "head "+head_id+" label "+video_channel_id;
            //patch_label(head_id,video_channel_id,label);
        
        }
        //patch audio
        //if(h_id == 0)
        {
            for(let audio_channel_id = 0; audio_channel_id < (C_AUDIO_CHANNELS_NUM*2);audio_channel_id++)
            {
                patch_sdp(result.result_value[0].processing_object_id,audio_channel_id,'audio');        
            }        
        }
    } else {

        console.log("empty head_id = " + h_id);

    }
    
    //await delay(500);

    if((h_id+1) < C_HEADS_NUM)    
    {           
        h_id++;
        let db_request           = `multiviewer_heads?screen_id=eq.${h_id}`;       
        read("video",db_request,head_result,h_id);            
    }

}


async function change_layout_result(result : any)
{
    
   


      //layout
      if(h_id < C_HEADS_NUM)
      {
          //
          {
          //3  1x1    
          //9  2x2
          //16 3x3
              //23 4x4
          //30 5x5
          //51 8x8
    
              let layout_id            = 24;//23;//51;//44;//51;//16;//23;//16;
  
              let db_schema            = "video"
              let db_request           = `multiviewer_heads?screen_id=eq.${h_id}`;    
              let db_table_record         = {
                  layout_id    : layout_id,
                  display_mode : 'on'
                  //display_mode : 'name'
              };
  
              let db_table_record_str  = JSON.stringify(db_table_record);            
              update(db_schema,db_request,db_table_record_str,change_layout_result);    
              console.log("change layout head_id = " + h_id);
              h_id++;
          }
          
      }  else {

        h_id = 0;
        {   
            let db_request           = `multiviewer_heads?screen_id=eq.${h_id}`;           
            read("video",db_request,head_result,h_id);            
        }
      }        


}


async function login_result(result : any)
{ 
    
    change_layout_result(result);
}

login(username,password,login_result); 

