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
  
    let sdp = `
	v=0
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

let total_sources = 25;//256*16;//32*2;

function getRandomInt(max : number) 
{
    return Math.floor(Math.random() * max);
}

function get_video_sdp_test(id : number)
{
    let src_id = id;//0

    
    let sdp = `
    v=0
    o=- 0 1 IN IP4 172.16.4.130
    s=Streamed by V__matrix
    i=C100 130 TX05
    t=0 0
    a=group:DUP primary secondary
    m=video 9000 RTP/AVP 97
    c=IN IP4 239.5.4.130
    a=source-filter: incl IN IP4 239.5.4.130 172.16.4.130
    a=rtpmap:97 raw/90000
    a=fmtp:97 SSN=ST2110-20:2017; TP=2110TPN; depth=10; sampling=YCbCr-4:2:2; TCS=SDR; PM=2110GPM; colorimetry=BT709; range=NARROW; width=1920; height=1080; interlace; exactframerate=25;
    a=mid:primary
    m=video 9000 RTP/AVP 97
    c=IN IP4 239.5.4.135
    a=source-filter: incl IN IP4 239.5.4.135 172.16.4.135
    a=rtpmap:97 raw/90000
    a=fmtp:97 SSN=ST2110-20:2017; TP=2110TPN; depth=10; sampling=YCbCr-4:2:2; TCS=SDR; PM=2110GPM; colorimetry=BT709; range=NARROW; width=1920; height=1080; interlace; exactframerate=25;
    a=mid:secondary`;

    return sdp;



}


let video_streams = [


    // {  name      : "edge" , p_src_ip  : "10.63.124.107",p_dst_ip  : "239.63.7.8",s_src_ip  : "10.63.124.107",s_dst_ip  : "239.63.7.8", std_str : "width=1920; height=1080; exactframerate=60000/1001;", port : 30000  },//.edge pcap for simulation port 30000
    // {  name      : "edge" , p_src_ip  : "10.63.124.107",p_dst_ip  : "239.63.7.8",s_src_ip  : "10.63.124.107",s_dst_ip  : "239.63.7.8", std_str : "width=1920; height=1080; exactframerate=60000/1001;", port : 30000  },//.edge pcap for simulation port 30000
    
    ///*00*/{  name      : "00-AT-233.2-MountainBike"              , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.0.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.0.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*01*/{  name      : "01-AT-233.2-Golfer"                    , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.1.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.1.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*02*/{  name      : "02-AT-233.2-Gliding"                   , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.2.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.2.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*03*/{  name      : "03-AT-233.2-FPGA-vs-CPU"               , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.3.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.3.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*04*/{  name      : "04-AT-233.2-The Sphere"                , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.4.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.4.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*05*/{  name      : "05-AT-233.2-Paraglider"                , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.5.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.5.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*06*/{  name      : "06-AT-233.2-Race"                      , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.6.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.6.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*07*/{  name      : "07-AT-233.2-Butterfly"                 , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.7.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.7.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*08*/{  name      : "08-AT-233.2-Ski"                       , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.8.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.8.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*09*/{  name      : "09-AT-233.2-Rally"                     , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.9.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.9.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*10*/{  name      : "10-AT-233.2-Guitar"                    , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.10.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.10.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*11*/{  name      : "11-AT-233.2-Sunset"                    , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.11.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.11.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*12*/{  name      : "12-AT-233.2-Swans"                     , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.12.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.12.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*13*/{  name      : "13-AT-233.2-Woman"                     , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.13.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.13.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*14*/{  name      : "14-AT-233.2-Barbary Macaque"           , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.14.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.14.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },	
    /*15*/{  name      : "15-AT-233.2-Hang Gliding"              , p_src_ip  : "172.16.233.0",p_dst_ip  : "239.15.233.0",s_src_ip  : "172.16.233.1",s_dst_ip  : "239.15.233.1", std_str : "width=1920; height=1080;  exactframerate=50;", port : 9000  },
    /*16*/{  name      : "16-AT--23.24-Squirrel"                 , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.0.234.0" ,s_src_ip  : "172.16.234.1",s_dst_ip  : "239.0.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*17*/{  name      : "17-AT-234.2-Stunt"                     , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.1.234.0" ,s_src_ip  : "172.16.234.1",s_dst_ip  : "239.1.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*18*/{  name      : "18-AT-234.2-Snail"                     , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.2.234.0" ,s_src_ip  : "172.16.234.1",s_dst_ip  : "239.2.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*19*/{  name      : "19-AT-234.2-Running"                   , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.3.234.0" ,s_src_ip  : "172.16.234.1",s_dst_ip  : "239.3.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*20*/{  name      : "20-AT-234.2-Sven"                      , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.4.234.0" ,s_src_ip  : "172.16.234.1",s_dst_ip  : "239.4.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*21*/{  name      : "21-AT-234.2-Motor Boad"                , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.5.234.0" ,s_src_ip  : "172.16.234.1",s_dst_ip  : "239.5.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*22*/{  name      : "22-AT-234.2-Bird"                      , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.6.234.0" ,s_src_ip  : "172.16.234.1",s_dst_ip  : "239.6.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*23*/{  name      : "23-AT-234.2-Golf"                      , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.7.234.0" ,s_src_ip  : "172.16.234.1",s_dst_ip  : "239.7.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*24*/{  name      : "24-AT-234.2-Bike"                      , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.8.234.0" ,s_src_ip  : "172.16.234.1",s_dst_ip  : "239.8.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*25*/{  name      : "25-AT-234.2-Robin"                     , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.9.234.0" ,s_src_ip  : "172.16.234.1",s_dst_ip  : "239.9.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    
    /*26*/{  name      : "26-AT-234.2-AT-300MF-front"            , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.10.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.10.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*27*/{  name      : "27-AT-234.2-AT-300MF-rear"             , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.11.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.11.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*28*/{  name      : "28-AT-234.2-BRAni-Vid"                 , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.12.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.12.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },
    /*29*/{  name      : "29-AT-234.2-BRAni-Alpha"               , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.13.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.13.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*30*/{  name      : "30-AT-234.2-BR-lower-third-Vid"        , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.14.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.14.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*31*/{  name      : "31-AT-234.2-BR-lower-third-alpha"      , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.15.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.15.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },
    /*32*/{  name      : "32-AT-234.2-BR-icon-Vid"               , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.16.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.16.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*33*/{  name      : "33-AT-234.2-BR-icon-Alpha"             , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.17.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.17.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*34*/{  name      : "34-AT-234.2-OmnitekTSA1920-1080i50"    , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.18.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.18.234.1" , std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },
    /*35*/{  name      : "35-AT-234.2-OmnitekTSA1920-1080p50"    , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.19.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.19.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*36*/{  name      : "36-AT-234.2-OmnitekTSA1280-720p50"     , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.20.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.20.234.1" , std_str : "width=1280; height=720; exactframerate=50;", port : 9000  },	
    /*37*/{  name      : "37-AT-234.2-OmnitekTSA1920-1080i59_94" , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.21.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.21.234.1" , std_str : "width=1920; height=1080; interlace; exactframerate=30000/1001;", port : 9000  },
    
    /*58*/{  name      : "38-AT-234.2-OmnitekTSA1280-720p59_94"  , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.22.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.22.234.1" , std_str : "width=1280; height=720; exactframerate=60000/1001;", port : 9000  },
    /*59*/{  name      : "39-AT-234.2-Video-Mixer-0"             , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.23.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.23.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*60*/{  name      : "40-AT-234.2-Video-Mixer-1"             , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.24.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.24.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    /*61*/{  name      : "41-AT-234.2-Video-Mixer-2"             , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.25.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.25.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },
    /*62*/{  name      : "42-AT-234.2-Video-Mixer-3"             , p_src_ip  : "172.16.234.0",p_dst_ip  : "239.26.234.0" ,s_src_ip : "172.16.234.1",s_dst_ip  : "239.26.234.1" , std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },
    
    // /*63*/{  name      : "43-AT-4.132-SAT Receiver 1"            , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.0.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.0.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },	
    // /*64*/{  name      : "44-AT-4.132-SAT Receiver 2"            , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.1.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.1.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },
    // /*65*/{  name      : "45-AT-4.132-BM Player 1"               , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.2.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.2.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },	
    // /*66*/{  name      : "46-AT-4.132-BM Player 2"               , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.3.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.3.4.131", std_str : "width=1920; height=1080; exactframerate=50;", port : 9000  },	
    // /*67*/{  name      : "47-AT-4.132-Raspi-1-Iron Maiden"       , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.4.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.4.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },
    // /*68*/{  name      : "48-AT-4.132-Raspi-2-GER vs ITA"        , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.5.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.5.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },	
    // /*69*/{  name      : "49-AT-4.132-Raspi-3-Sport"             , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.6.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.6.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },	
    // /*70*/{  name      : "50-AT-4.132-Raspi-4-Handball"          , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.7.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.7.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },
    // /*71*/{  name      : "51-AT-4.132-Raspi-5-Bars"              , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.8.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.8.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },	
    // /*72*/{  name      : "52-AT-4.132-Raspi-6-V-matrix"          , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.9.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.9.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },	
    // /*73*/{  name      : "53-AT-4.132-Raspi-7-Ramstein Concert"  , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.10.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.10.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },
    // /*74*/{  name      : "54-AT-4.132-Raspi-8-Terra X"           , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.11.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.11.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },
    // /*75*/{  name      : "55-AT-4.132-Raspi-9-NEP Australia"     , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.12.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.12.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },
    // /*76*/{  name      : "56-AT-4.132-Raspi-10-DFB Final"        , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.13.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.13.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },	
    // /*77*/{  name      : "57-AT-4.132-Raspi-11-WDR"              , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.14.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.14.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },
    // /*78*/{  name      : "58-AT-4.132-Raspi-12-Rugby"            , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.15.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.15.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },	
    // /*79*/{  name      : "59-AT-4.132-Raspi-13-Handball-2"       , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.16.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.16.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },
    // /*80*/{  name      : "60-AT-4.132-Raspi-14-IBC"              , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.17.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.17.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },	
    // /*81*/{  name      : "61-AT-4.132-Raspi-15-Arte"             , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.18.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.18.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },	
    // /*82*/{  name      : "62-AT-4.132-Raspi-16-Arte Biwak"       , p_src_ip  : "172.16.4.130",p_dst_ip  : "239.19.4.130",s_src_ip  : "172.16.4.131",s_dst_ip  : "239.19.4.131", std_str : "width=1920; height=1080; interlace; exactframerate=25;", port : 9000  },
];



function get_video_sdp(id : number)
{         
    let stream_id = Math.floor(source_id%video_streams.length); source_id++;

    let stream = video_streams[stream_id];
	
let sdp = `v=0
o=- 0 1 IN IP4 ${stream.p_src_ip}
s= ${stream.name}
i= ${stream.name}
t=0 0
a=group:DUP primary secondary
m=video ${stream.port} RTP/AVP 97
c=IN IP4 ${stream.p_dst_ip}
a=source-filter: incl IN IP4 ${stream.p_dst_ip} ${stream.p_src_ip}
a=rtpmap:97 raw/90000
a=fmtp:97 SSN=ST2110-20:2017; TP=2110TPN; depth=10; sampling=YCbCr-4:2:2; TCS=SDR; PM=2110GPM; colorimetry=BT709; range=NARROW; ${stream.std_str}
a=mid:primary
m=video ${stream.port} RTP/AVP 97
c=IN IP4 ${stream.s_dst_ip}
a=source-filter: incl IN IP4 ${stream.s_dst_ip} ${stream.s_src_ip}
a=rtpmap:97 raw/90000
a=fmtp:97 SSN=ST2110-20:2017; TP=2110TPN; depth=10; sampling=YCbCr-4:2:2; TCS=SDR; PM=2110GPM; colorimetry=BT709; range=NARROW; ${stream.std_str}
a=mid:secondary`;

    return sdp;

}

function get_audio_sdp(id : number)
{
    
    let max_channels = 2;
    let tmp_idd = Math.floor(id/2);//id%max_channels;
    let tmp_id  = Math.floor(tmp_idd%max_channels);
    
    // let channels_num = 16;
  

    console.log(`get_audio_sdp ${tmp_id}`);

    //tmp_id = 0;

    if(tmp_id == 0)
    {
        let sdp = `v=0
            o=- 0 1 IN IP4 172.16.116.0
            s=AVP-4K-Systemtest: Audio stream 1
            i=Stream 01
            t=0 0
            a=group:DUP primary secondary
            m=audio 9000 RTP/AVP 98
            c=IN IP4 239.20.116.0/0
            a=source-filter: incl IN IP4 239.20.116.0 172.16.116.0
            a=rtpmap:98 L24/48000/16
            a=framecount:6
            a=ptime:0.125
            a=mediaclk:direct=0
            a=mid:primary
            m=audio 9000 RTP/AVP 98
            c=IN IP4 239.20.116.5/0
            a=source-filter: incl IN IP4 239.20.116.5 172.16.116.5
            a=rtpmap:98 L24/48000/16
            a=framecount:6
            a=ptime:0.125
            a=mediaclk:direct=0
            a=mid:secondary`;

        return sdp;
    } else {
        let sdp = `v=0
            o=- 0 1 IN IP4 172.16.116.0
            s=AVP-4K-Systemtest: Audio stream 4
            i=Stream 04
            t=0 0
            a=group:DUP primary secondary
            m=audio 9000 RTP/AVP 98
            c=IN IP4 239.23.116.0/0
            a=source-filter: incl IN IP4 239.23.116.0 172.16.116.0
            a=rtpmap:98 L24/48000/16
            a=framecount:6
            a=ptime:0.125
            a=mediaclk:direct=0
            a=mid:primary
            m=audio 9000 RTP/AVP 98
            c=IN IP4 239.23.116.5/0
            a=source-filter: incl IN IP4 239.23.116.5 172.16.116.5
            a=rtpmap:98 L24/48000/16
            a=framecount:6
            a=ptime:0.125
            a=mediaclk:direct=0
            a=mid:secondary`;        

        return sdp;
    }

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
       sdp                                   : tmpsdp,
       //user_afu_id                           : 1,
       //user_ingress_on_afu_ethernet_port_id  : 1,
       //user_egress_on_afu_ethernet_port_id   : 1,
       //user_egress_extra_primary_addresses   : ["239.16.0.1","239.16.0.2","239.16.0.3","239.16.0.4","239.16.0.5"], 
       //user_egress_extra_secondary_addresses : ["239.16.1.1","239.16.1.2","239.16.1.3","239.16.1.4","239.16.1.5"]
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



let C_HEADS_NUM            = 6;//8*2;//40;
let C_VIDEO_CHANNELS_NUM   = 64;//16;////38;//34;//16;
let C_AUDIO_CHANNELS_NUM   = 64*0;//16;
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
            console.log("video_channel_id = " + video_channel_id);
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

	      let stripe = Math.floor(h_id/8);
	      let dir = stripe%2;		    

              //let layout_id            = 3 + Math.floor(h_id%8)*7;//23;//51;//44;//51;//16;//23;//16;
	      //let layout_id = 3 + 35;
	      let layout_id            = (h_id < 2) ? 170 : 56;//56;//37;//51;//23;//105;//9;


	      if(dir > 0)
	      {
		layout_id = 4 + 7*7 - Math.floor(h_id%8)*7;
	      } 
		
 	      
	


              layout_id            = 52;
  
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

