import {round_to_even}  from './layouts_default';


export function get_multi_proview_cut_zoom(url : any,layouts : any[],row : number, col : number,proview_id : number,proview_group_id : number)
{        
    let layout_name = "Proview"+(proview_id+1);    
    layout_name += ((proview_group_id)?"_B":"_A");
    layout_name += (col+1);


    let layout = {
        db_schema         : 'video',   
        db_table          : 'multiviewer_layouts', 
        db_table_records  :
        [
           {
              name                   :  layout_name//,
              //style_bgnd_color       : 'green'                
           }                                    
        ],
        children    : <any>[],
        x           : 0,
        y           : 0
    }   

    //BGND
    //if(false)
    {                
        {
            let video_source = {
                db_schema         : 'video',   
                db_table          : 'multiviewer_layout_video_sources', 
                db_table_records  :
                [
                    {                          
                        style_top           : 0,
                        style_left          : 0,
                        style_width         : 1920,
                        style_height        : 1080,
                        style_z_index       : 0                    
                    }                                    
                ]            
            }       
            layout.children.push(video_source);    
        }
    }
    
     //BGND_PIP
     //if(false)
     {                                     
        {
            let video_source = {
                db_schema         : 'video',   
                db_table          : 'multiviewer_layout_video_sources', 
                db_table_records  :
                [
                    {                          
                        style_top           : 832,
                        style_left          : -22,
                        style_width         : 377,
                        style_height        : 231,

                        crop_left           : 48,
                        crop_right          : 48,
                        crop_top            : 0,
                        crop_bottom         : 0,

                        style_z_index       : 1                    
                    }                                    
                ]            
            }       
            layout.children.push(video_source);    
        }
          
     }   

    //FGND
    //if(false)
    {    
                     
        
        let iframe_left    = 180 + col*318;
        let iframe_top     = (row == 0) ? 107 : 736;                 
        
       
        
        let iframe = {
            db_schema         : 'video',   
            db_table          : 'multiviewer_layout_web_graphics_generators', 
            db_table_records  :
            [
                {                          
                    style_top              : 832,
                    style_left             : 16,
                    style_width            : 302,
                    style_height           : 231,

                    iframe_use_widget_size : false,
                    iframe_zoom            : 0.85,
                    iframe_top             : iframe_top,
                    iframe_left            : iframe_left,
                    iframe_width           : 1920,
                    iframe_height          : 1080,                   
                    style_z_index          : 20,                                                    
                    graphics_url           : url

                }                                    
            ]            
        }   
        //console.log(video_source);

        layout.children.push(iframe);    
    }
    layouts.push(layout);   
}

export function get_proviews_valorant(url : any, proview_id : number,layouts : any[])
{
    for(let proview_group_id = 0; proview_group_id < 2; proview_group_id++)
    {
        for(let col = 0; col < 5;col++)          
        {
            get_multi_proview_cut_zoom(url,layouts,(proview_group_id==0)?0:2,col,proview_id,proview_group_id);
        }
    }           
}
 
