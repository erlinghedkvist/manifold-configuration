// -----------------------------------------------------------------------------
// GENERIC UTILITIES
// -----------------------------------------------------------------------------
export function round_to_even(value : number)
{
    let result = 2*Math.floor(value/2);
    return result;
}

export function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

// -----------------------------------------------------------------------------
// CLUSTER-FACING CONFIGURATION TYPES
// -----------------------------------------------------------------------------
export type PpmValueConfiguration = number | number[];
export type MonitorDisplayMode = 'label' |
                                 'parent_video_source_name' |
                                 'parent_video_source_standard' |
                                 'parent_video_source_tally_label' |
                                 'parent_video_source_user_label_0' |
                                 'parent_video_source_user_label_1' |
                                 'parent_video_source_standard_interface' |
                                 'parent_video_source_standard_tcs';

// -----------------------------------------------------------------------------
// PPM CONFIGURATION HELPERS
// -----------------------------------------------------------------------------
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
        // Keep callers in charge of channel mapping and visibility. Some legacy
        // inside PPM styles use style_opacity=0, which hides rebuilt widgets.
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
            // Preserve visual tuning from the source style while replacing only
            // the requested channel mapping.
            copy_ppm_cell_style(ppms.cells[i],existing_ppms.cells[Math.min(i,existing_ppms.cells.length - 1)]);
        }
        ppms.cells[i].channels_offset = get_ppm_value(ppm_channels_offset,i);
        ppms.cells[i].channels_num    = get_ppm_value(ppm_channels,i);
    }

    return ppms;
}

export function configure_ppms(pip_configuration : any,
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

export function configure_default_ppm_layouts(parameters : any,
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
    let ppm_layout_ids = [
        OUTSIDE_LAYOUTS_UMD_PPM_ID,
        OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID,
        INSIDE_LAYOUTS_UMD_PPM_ID,
        INSIDE_LAYOUTS_UMD_PPM_TALLY_ID
    ];

    for(let i = 0; i < ppm_layout_ids.length;i++)
    {
        configure_ppms(parameters.pip_configurations[ppm_layout_ids[i]],
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
}

// -----------------------------------------------------------------------------
// MONITOR DISPLAY CONFIGURATION HELPERS
// -----------------------------------------------------------------------------
function configure_md_modes(md_configuration : any, modes : MonitorDisplayMode | MonitorDisplayMode[])
{
    if(md_configuration == null)
    {
        return;
    }

    for(let i = 0; i < md_configuration.cells.length;i++)
    {
        md_configuration.cells[i].mode = Array.isArray(modes) ? modes[Math.min(i,modes.length - 1)] : modes;
    }
}

export function configure_existing_umd_modes(parameters : any, modes : MonitorDisplayMode | MonitorDisplayMode[])
{
    for(let i = 0; i < parameters.pip_configurations.length;i++)
    {
        configure_md_modes(parameters.pip_configurations[i].umd,modes);
    }
}

export function configure_existing_omd_modes(parameters : any, modes : MonitorDisplayMode | MonitorDisplayMode[])
{
    for(let i = 0; i < parameters.pip_configurations.length;i++)
    {
        configure_md_modes(parameters.pip_configurations[i].omd,modes);
    }
}

// -----------------------------------------------------------------------------
// LAYOUT GENERATION INTERNALS
// -----------------------------------------------------------------------------
function generate_md(pip_id : any,md_geometry : any,md_parameters : any,layout : any,pip_interwidget_gap_x_size : any,on_parent_id_index : number)
{
    let current_x   = md_geometry.x;
    let width       = md_geometry.width - (pip_interwidget_gap_x_size*(md_parameters.cells.length-1));
    for(let  i = 0; i < md_parameters.cells.length;i++)
    {
            let current_width = Math.floor(width*md_parameters.cells[i].width);
            if(i == (md_parameters.cells.length-1))
            {
                current_width = ((md_geometry.x + md_geometry.width) - current_x);
            }
        
            let monitor_display = {
            db_schema         : 'video',   
            db_table          : 'multiviewer_layout_monitor_displays', 
            db_table_records  :
            [
               {                                                            
                parent_video_source_on_parent_id     : pip_id,
                style_top                            : md_geometry.y,
                style_left                           : current_x,
                style_width                          : current_width,
                style_height                         : md_geometry.height,                                                            
                style_z_index                        : 1,
                //
                on_parent_id_index                   : on_parent_id_index + i,
                //
                mode                                 : md_parameters.cells[i].mode,                 
                label                                : md_parameters.cells[i].label,
                //--bgnd
                style_bgnd_color                     : md_parameters.cells[i].style_bgnd_color, 
                style_opacity                        : md_parameters.cells[i].style_opacity,
                //--fgnd
                style_color                          : md_parameters.cells[i].style_color,
                style_font_opacity                   : md_parameters.cells[i].style_font_opacity,
                style_font_weight                    : md_parameters.cells[i].style_font_weight,
                style_font_family                    : md_parameters.cells[i].style_font_family,
                style_font_style                     : md_parameters.cells[i].style_font_style,
                style_text_stroke_width              : md_parameters.cells[i].style_text_stroke_width,
                style_text_stroke_color              : md_parameters.cells[i].style_text_stroke_color,
                //--border                
                style_border_top_left_radius         : md_parameters.cells[i].style_border_top_left_radius,
                style_border_top_right_radius        : md_parameters.cells[i].style_border_top_right_radius,
                style_border_bottom_left_radius      : md_parameters.cells[i].style_border_bottom_left_radius,
                style_border_bottom_right_radius     : md_parameters.cells[i].style_border_bottom_right_radius,            
                border_alignment                     : md_parameters.cells[i].border_alignment,                                  
                style_border_width                   : md_parameters.cells[i].style_border_width, 
                style_border_color                   : md_parameters.cells[i].style_border_color,
                //tally
                tally_bgnd_rules_mask                : md_parameters.cells[i].tally_bgnd_rules_mask,
                tally_fgnd_rules_mask                : md_parameters.cells[i].tally_fgnd_rules_mask,
                tally_border_rules_mask              : md_parameters.cells[i].tally_border_rules_mask
               }                                    
            ] 
        }    
        layout.children.push(monitor_display);                  
        current_x   += (current_width + pip_interwidget_gap_x_size);
    }
}

function generate_audio_sources(pip_id : any,as_geometry : any,as_parameters : any,layout : any,on_parent_id_index : number)
{
    // When more than one PPM cell is configured, split the available width evenly
    // and leave any rounding remainder unused so every meter renders identically.
    const cells_num    = as_parameters.cells.length;
    const base_width   = Math.floor(as_geometry.width / cells_num);
    let current_x      = as_geometry.x;

    for(let  i = 0; i < cells_num; i++)
    {
        const cell_width     = base_width;

        let audio_source = {
            db_schema         : 'video',   
            db_table          : 'multiviewer_layout_audio_sources', 
            db_table_records  :
            [
               {      
                   parent_video_source_on_parent_id  : pip_id,
                   style_top                         : as_geometry.y,
                   style_left                        : current_x,
                   style_width                       : cell_width,
                   style_height                      : as_geometry.height,
                   style_z_index                     : 1,
                   //--
                   on_parent_id_index                : on_parent_id_index +2*i,
                   //--
                   channels_offset                   : as_parameters.cells[i].channels_offset,
                   channels_num                      : as_parameters.cells[i].channels_num,
                   //--
                   style_opacity                     : as_parameters.cells[i].style_opacity,
                   ppm_green_colour_on               : as_parameters.cells[i].ppm_green_colour_on,
                   ppm_green_colour_off              : as_parameters.cells[i].ppm_green_colour_off,      
                   ppm_yellow_colour_on              : as_parameters.cells[i].ppm_yellow_colour_on,
                   ppm_yellow_colour_off             : as_parameters.cells[i].ppm_yellow_colour_off, 
                   ppm_red_colour_on                 : as_parameters.cells[i].ppm_red_colour_on,
                   ppm_red_colour_off                : as_parameters.cells[i].ppm_red_colour_off,
                   ppm_opacity_on                    : as_parameters.cells[i].ppm_opacity_on                         
               }                                    
            ]            
        }   
        layout.children.push(audio_source);
        current_x += cell_width;
    }
}

function get_ppms_channels_max(ppms_parameters : any)
{
    let channels_max = 0;
    for(let i = 0; i < ppms_parameters.cells.length;i++)
    {
        channels_max = Math.max(channels_max,ppms_parameters.cells[i].channels_num);
    }
    return channels_max;
}

function get_ppms_width(ppms_parameters : any,pip_width : number)
{
    let width = Math.floor(ppms_parameters.width*pip_width);

    if(ppms_parameters.channel_min_width != null)
    {
        // Dense layouts can make a fixed percentage width too narrow for
        // multi-channel meters. Grow the side width only as needed, then cap it
        // so PPMs do not consume too much of the PIP.
        const meters_num       = ppms_parameters.cells.length;
        const channels_max     = get_ppms_channels_max(ppms_parameters);
        const min_width        = meters_num*channels_max*ppms_parameters.channel_min_width;
        const max_width        = Math.floor((ppms_parameters.width_max ?? ppms_parameters.width)*pip_width);

        width = Math.min(Math.max(width,min_width),max_width);
    }

    return width;
}


function generate_pip(pip_id : any,pip_geometry : any ,parameters : any,layout : any)
{
    /*
    console.log("pip_geometry");
    console.log(pip_geometry);
    console.log("parameters");
    console.log(parameters);
    */

    //console.log(pip_id);

    //calculate geometry
    let pip_width               = Math.floor(pip_geometry.width  - 2*parameters.pip_edge_gap_x_size);
    let pip_height              = Math.floor(pip_geometry.height - 2*parameters.pip_edge_gap_y_size);
    let umd_height              = (parameters.pip_configuration.umd != null) ? Math.floor(parameters.pip_configuration.umd.height*pip_height) : 0;    
    let omd_height              = (parameters.pip_configuration.omd != null) ? Math.floor(parameters.pip_configuration.omd.height*pip_height) : 0;
    let ppms_left_width         = (parameters.pip_configuration.ppms_left != null) ? get_ppms_width(parameters.pip_configuration.ppms_left,pip_width) : 0;    
    let ppms_right_width        = (parameters.pip_configuration.ppms_right != null) ? get_ppms_width(parameters.pip_configuration.ppms_right,pip_width) : 0;
    let video_source_x          = Math.floor(pip_geometry.x) + parameters.pip_edge_gap_x_size;
    let video_source_y          = Math.floor(pip_geometry.y) + parameters.pip_edge_gap_y_size;
    let video_source_height     = pip_height;
    let video_source_width      = pip_width;
    let hole_left               = 0;
    let hole_right              = 0;
    let hole_top                = 0;
    let hole_bottom             = 0;

    
    if((parameters.pip_configuration.umd != null) && (parameters.pip_configuration.umd.alignment == 'outside'))
    {      
        video_source_height -= (umd_height + parameters.pip_interwidget_gap_y_size);     
    }
    if((parameters.pip_configuration.omd != null) && (parameters.pip_configuration.omd.alignment == 'outside'))
    {
        video_source_height -= (omd_height + parameters.pip_interwidget_gap_y_size);
        video_source_y      += (omd_height + parameters.pip_interwidget_gap_y_size);
    }
    if(parameters.pip_configuration.keep_aspect_ratio)
    {
        video_source_width   = round_to_even((video_source_height*16)/9);        
        if(video_source_width < pip_width)
        {
            video_source_x       += Math.floor((pip_geometry.width - video_source_width)/2);
        }else
        {
            video_source_width  = pip_width;
            video_source_height =  round_to_even((video_source_width*9)/16);
            video_source_y     += round_to_even((pip_height - video_source_height - umd_height)/2);
        }        
    }
    //correct if does not fit
    {
        let total_width             = video_source_width;
        let total_ppms_width        = 0;
        if((parameters.pip_configuration.ppms_left != null) && (parameters.pip_configuration.ppms_left.alignment == 'outside'))
        {
            total_width       += (ppms_left_width + parameters.pip_interwidget_gap_x_size);
            total_ppms_width  += (ppms_left_width + parameters.pip_interwidget_gap_x_size);
        }    
        if((parameters.pip_configuration.ppms_right != null) && (parameters.pip_configuration.ppms_right.alignment == 'outside'))
        {
            total_width       += (ppms_right_width + parameters.pip_interwidget_gap_x_size);
            total_ppms_width  += (ppms_right_width + parameters.pip_interwidget_gap_x_size);
        }   
        if(total_width  > pip_width)
        {
            video_source_width = pip_width - total_ppms_width;
            let current_x = Math.floor(pip_geometry.x) + parameters.pip_edge_gap_x_size;
            if((parameters.pip_configuration.ppms_left != null) && (parameters.pip_configuration.ppms_left.alignment == 'outside'))
            {
                current_x += (ppms_left_width + parameters.pip_interwidget_gap_x_size);
            }
            video_source_x = current_x;  
            if(parameters.pip_configuration.keep_aspect_ratio)
            {
                video_source_height   = round_to_even((video_source_width*9)/16); 
                let total_height      = video_source_height;
                if((parameters.pip_configuration.umd != null) && (parameters.pip_configuration.umd.alignment == 'outside'))
                {
                    total_height     += (umd_height + parameters.pip_interwidget_gap_y_size);
                }
                if((parameters.pip_configuration.omd != null) && (parameters.pip_configuration.omd.alignment == 'outside'))
                {
                    total_height     += (omd_height + parameters.pip_interwidget_gap_y_size);
                }
                video_source_y = Math.floor((pip_geometry.y + parameters.pip_edge_gap_y_size) + (pip_height - total_height)/2);
            }          
        }
    }
    //
    let ppms_left_height         = video_source_height;
    let ppms_left_x              = video_source_x - ppms_left_width - parameters.pip_interwidget_gap_x_size;
    let ppms_left_y              = video_source_y;
    if((parameters.pip_configuration.ppms_left != null) && parameters.pip_configuration.ppms_left.alignment =='inside')
    {
        ppms_left_x              = video_source_x + parameters.pip_interwidget_gap_x_size;
        ppms_left_y              = video_source_y + parameters.pip_interwidget_gap_y_size;
        ppms_left_height         = video_source_height - parameters.pip_interwidget_gap_y_size*2;
        hole_left                = (ppms_left_width + 2*parameters.pip_interwidget_gap_x_size);
    }    
    let ppms_right_height        = video_source_height;
    let ppms_right_x             = video_source_x + video_source_width + parameters.pip_interwidget_gap_x_size;
    let ppms_right_y             = video_source_y;
    if((parameters.pip_configuration.ppms_right != null) && parameters.pip_configuration.ppms_right.alignment =='inside')
    {
        ppms_right_x             = video_source_x + video_source_width - (parameters.pip_interwidget_gap_x_size + ppms_right_width);
        ppms_right_y             = video_source_y + parameters.pip_interwidget_gap_y_size;
        ppms_right_height        = video_source_height - parameters.pip_interwidget_gap_y_size*2;
        hole_right               = (ppms_right_width + 2*parameters.pip_interwidget_gap_x_size);
    }
 
    let umd_x                    = video_source_x;
    let umd_y                    = video_source_y + video_source_height + parameters.pip_interwidget_gap_y_size;
    let umd_width                = video_source_width;
    
    if(parameters.pip_configuration.umd != null)
    {    
        umd_width                = Math.floor(umd_width*(parameters.pip_configuration.umd.width));
        umd_x                   += Math.floor((video_source_width - umd_width)/2);
        if(parameters.pip_configuration.umd.alignment == 'inside')
        {
            umd_width            -= (parameters.pip_interwidget_gap_x_size*2);
            umd_x                += parameters.pip_interwidget_gap_x_size;
            umd_y = video_source_y + video_source_height - parameters.pip_interwidget_gap_y_size - umd_height;
            hole_bottom = (umd_height + parameters.pip_interwidget_gap_y_size);

            if((parameters.pip_configuration.ppms_left != null) && parameters.pip_configuration.ppms_left.alignment =='inside')
            {
                umd_x            +=(ppms_left_width + parameters.pip_interwidget_gap_x_size);
                umd_width        -=(ppms_left_width + parameters.pip_interwidget_gap_x_size);               
            }
            if((parameters.pip_configuration.ppms_right != null) && parameters.pip_configuration.ppms_right.alignment =='inside')
            {
                umd_width        -=(ppms_right_width + parameters.pip_interwidget_gap_x_size); 
            }
        }
    }    
    let omd_x                    = umd_x;
    let omd_y                    = parameters.pip_edge_gap_y_size;
    let omd_width                = umd_width;            

    if(parameters.pip_configuration.omd != null)
    {
        omd_width               = Math.floor(umd_width*(parameters.pip_configuration.omd.width));
        omd_x                  += Math.floor((video_source_width - omd_width)/2);
        if(parameters.pip_configuration.omd.alignment == 'inside')
        {
            omd_y       = video_source_y + parameters.pip_interwidget_gap_y_size;
            hole_top    = (omd_height + parameters.pip_interwidget_gap_y_size);
        } 
    }


    let tally_lamps_left_y              = umd_y;    
    let tally_lamps_left_width          = umd_height;
    let tally_lamps_left_height         = umd_height;
    let tally_lamps_left_x              = umd_x - parameters.pip_interwidget_gap_x_size - tally_lamps_left_width;
    
    //--
    let tally_lamps_left_y_second       = umd_y; 
    let tally_lamps_left_x_second       = ppms_left_x;
    let tally_lamps_left_width_second   = tally_lamps_left_width;
    let tally_lamps_left_height_second  = tally_lamps_left_height;  
     
    if(parameters.pip_configuration.tally_lamps_left != null)
    {
        if(parameters.pip_configuration.umd.alignment == 'outside')
        {
            if(tally_lamps_left_x < video_source_x)
            {
                tally_lamps_left_x = video_source_x;
                let new_umd_x = tally_lamps_left_x + tally_lamps_left_width + parameters.pip_interwidget_gap_x_size;
                let delta = (new_umd_x - umd_x);
                umd_x = new_umd_x;
                umd_width -= delta;       
            }                
            if(parameters.pip_configuration.tally_lamps_left.cells.length > 1)
            {
                tally_lamps_left_x_second = tally_lamps_left_x - (parameters.pip_interwidget_gap_x_size + tally_lamps_left_width_second);

                let left_edge = ppms_left_x;    

                if(parameters.pip_configuration.ppms_left == null)
                {
                    left_edge = parameters.pip_edge_gap_x_size;
                }    
                if(tally_lamps_left_x_second < left_edge)
                {
                    tally_lamps_left_x_second     = left_edge;
                    tally_lamps_left_width_second = (tally_lamps_left_x - parameters.pip_interwidget_gap_x_size) -  left_edge;
                }
            }
        } else {

            tally_lamps_left_x = umd_x;
            umd_x             += (tally_lamps_left_width + parameters.pip_interwidget_gap_x_size);
            umd_width         -= (tally_lamps_left_width + parameters.pip_interwidget_gap_x_size);            
            //todo second left tally
        }
    }

    let tally_lamps_right_y             = umd_y;
    let tally_lamps_right_x             = (umd_x + umd_width + parameters.pip_interwidget_gap_x_size);
    let tally_lamps_right_width         = tally_lamps_left_width;
    let tally_lamps_right_height        = tally_lamps_left_height;    
    //--
    let tally_lamps_right_y_second      = tally_lamps_right_y; 
    let tally_lamps_right_x_second      = tally_lamps_right_x;
    let tally_lamps_right_width_second  = tally_lamps_right_width;
    let tally_lamps_right_height_second = tally_lamps_right_height;  
    if(parameters.pip_configuration.tally_lamps_right != null)
    {     

        if(parameters.pip_configuration.umd.alignment == 'outside')
        {
            if((tally_lamps_right_x + tally_lamps_right_width) > (video_source_x + video_source_width))
            {
                let delta = ((tally_lamps_right_x + tally_lamps_right_width)) - (video_source_x + video_source_width);
                umd_width -= delta;
                tally_lamps_right_x -= delta;
            }
       
            if(parameters.pip_configuration.tally_lamps_right.cells.length > 1)
            {
                tally_lamps_right_x_second      = tally_lamps_right_x + tally_lamps_right_width + parameters.pip_interwidget_gap_x_size;
           
                let right_edge = Math.floor(pip_geometry.x + pip_geometry.width - parameters.pip_edge_gap_x_size);
                if((tally_lamps_right_x_second + tally_lamps_right_width_second) > right_edge)
                {
                    let delta = ((tally_lamps_right_x_second + tally_lamps_right_width_second) - right_edge);
                    tally_lamps_right_width_second  -= delta;
                }
            }  
        } else {
            umd_width          -= (tally_lamps_right_width + parameters.pip_interwidget_gap_x_size); 
            tally_lamps_right_x = (umd_x + umd_width + parameters.pip_interwidget_gap_x_size);                                                                         
             //todo second right tally      
        }              
    }

    //video source
    if(parameters.pip_configuration.video_source != null)
    {                
        let video_source = {
            db_schema         : 'video',   
            db_table          : 'multiviewer_layout_video_sources', 
            db_table_records  :
            [
               {                          
                  style_top                                     : video_source_y,
                  style_left                                    : video_source_x,
                  style_width                                   : video_source_width,
                  style_height                                  : video_source_height,
                  style_z_index                                 : 0,
                  //
                  border_alignment                              : parameters.pip_configuration.video_source.border_alignment,
                  style_border_width                            : parameters.pip_configuration.video_source.style_border_width,      
                  style_border_color                            : parameters.pip_configuration.video_source.style_border_color,
                  tally_border_rules_mask                       : parameters.pip_configuration.video_source.tally_border_rules_mask,
                  //
                  hole_enable                                   : true,
                  hole_left                                     : hole_left,
                  hole_right                                    : hole_right,
                  hole_top                                      : hole_top,
                  hole_bottom                                   : hole_bottom,
                  //
                  use_widgets_enable                            : parameters.pip_configuration.video_source.use_widgets_enable,
                  //
                  alarms_enable                                 : parameters.pip_configuration.video_source.alarms_enable,
                  alarms_on_video_source_not_assigned_show_logo : parameters.pip_configuration.video_source.alarms_on_video_source_not_assigned_show_logo
               }                                    
            ]            
        } 
        layout.children.push(video_source);           
    }       
    //left tally
    if(parameters.pip_configuration.tally_lamps_left != null)
    {
        let tally_lamp = {
            db_schema         : 'video',
            db_table          : 'multiviewer_layout_tally_lamps',
            db_table_records  :
                    [
                        {                            
                            parent_video_source_on_parent_id     : pip_id,
                            on_parent_id_index                   : 0,
                            style_top                            : tally_lamps_left_y,
                            style_left                           : tally_lamps_left_x,
                            style_width                          : tally_lamps_left_width,
                            style_height                         : tally_lamps_left_height,
                            style_z_index                        : 1,
                            style_border_width                   : parameters.pip_configuration.tally_lamps_left.cells[0].style_border_width, 
                            style_border_color                   : parameters.pip_configuration.tally_lamps_left.cells[0].style_border_color,                            
                            style_bgnd_color                     : parameters.pip_configuration.tally_lamps_left.cells[0].style_bgnd_color,            
                            style_opacity                        : parameters.pip_configuration.tally_lamps_left.cells[0].style_opacity,                                                                                     
                            style_border_top_left_radius         : parameters.pip_configuration.tally_lamps_left.cells[0].style_border_top_left_radius,
                            style_border_top_right_radius        : parameters.pip_configuration.tally_lamps_left.cells[0].style_border_top_right_radius,
                            style_border_bottom_left_radius      : parameters.pip_configuration.tally_lamps_left.cells[0].style_border_bottom_left_radius,
                            style_border_bottom_right_radius     : parameters.pip_configuration.tally_lamps_left.cells[0].style_border_bottom_right_radius,
                            tally_bgnd_rules_mask                : parameters.pip_configuration.tally_lamps_left.cells[0].tally_bgnd_rules_mask,
                            tally_border_rules_mask              : parameters.pip_configuration.tally_lamps_left.cells[0].tally_border_rules_mask
                        }
                    ]
                    }                                    
        layout.children.push(tally_lamp);
        if(parameters.pip_configuration.tally_lamps_left.cells.length > 1)
        {
            let tally_lamp = {
                db_schema         : 'video',
                db_table          : 'multiviewer_layout_tally_lamps',
                db_table_records  :
                        [
                            {                            
                                parent_video_source_on_parent_id     : pip_id,
                                on_parent_id_index                   : 2,
                                style_top                            : tally_lamps_left_y_second,
                                style_left                           : tally_lamps_left_x_second,
                                style_width                          : tally_lamps_left_width_second,
                                style_height                         : tally_lamps_left_height_second,
                                style_z_index                        : 1,
                                style_border_width                   : parameters.pip_configuration.tally_lamps_left.cells[1].style_border_width, 
                                style_border_color                   : parameters.pip_configuration.tally_lamps_left.cells[1].style_border_color,                            
                                style_bgnd_color                     : parameters.pip_configuration.tally_lamps_left.cells[1].style_bgnd_color,  
                                style_opacity                        : parameters.pip_configuration.tally_lamps_left.cells[1].style_opacity,                                                                                                                                                                        
                                style_border_top_left_radius         : parameters.pip_configuration.tally_lamps_left.cells[1].style_border_top_left_radius,
                                style_border_top_right_radius        : parameters.pip_configuration.tally_lamps_left.cells[1].style_border_top_right_radius,
                                style_border_bottom_left_radius      : parameters.pip_configuration.tally_lamps_left.cells[1].style_border_bottom_left_radius,
                                style_border_bottom_right_radius     : parameters.pip_configuration.tally_lamps_left.cells[1].style_border_bottom_right_radius,
                                tally_bgnd_rules_mask                : parameters.pip_configuration.tally_lamps_left.cells[1].tally_bgnd_rules_mask,
                                tally_border_rules_mask              : parameters.pip_configuration.tally_lamps_left.cells[1].tally_border_rules_mask 
                                
                            }
                        ]
                        }                                    
            layout.children.push(tally_lamp);
        }
    }
    //right tally 
    if(parameters.pip_configuration.tally_lamps_right != null)
        {
            let tally_lamp = {
                db_schema         : 'video',
                db_table          : 'multiviewer_layout_tally_lamps',
                db_table_records  :
                        [
                            {                            
                                parent_video_source_on_parent_id     : pip_id,
                                on_parent_id_index                   : 1,
                                style_top                            : tally_lamps_right_y,
                                style_left                           : tally_lamps_right_x,
                                style_width                          : tally_lamps_right_width,                                
                                style_height                         : tally_lamps_right_height,
                                style_z_index                        : 1,
                                style_border_width                   : parameters.pip_configuration.tally_lamps_right.cells[0].style_border_width, 
                                style_border_color                   : parameters.pip_configuration.tally_lamps_right.cells[0].style_border_color,                            
                                style_bgnd_color                     : parameters.pip_configuration.tally_lamps_right.cells[0].style_bgnd_color,        
                                style_opacity                        : parameters.pip_configuration.tally_lamps_right.cells[0].style_opacity,                                                                                                                                                                  
                                style_border_top_left_radius         : parameters.pip_configuration.tally_lamps_right.cells[0].style_border_top_left_radius,
                                style_border_top_right_radius        : parameters.pip_configuration.tally_lamps_right.cells[0].style_border_top_right_radius,
                                style_border_bottom_left_radius      : parameters.pip_configuration.tally_lamps_right.cells[0].style_border_bottom_left_radius,
                                style_border_bottom_right_radius     : parameters.pip_configuration.tally_lamps_right.cells[0].style_border_bottom_right_radius,
                                tally_bgnd_rules_mask                : parameters.pip_configuration.tally_lamps_right.cells[0].tally_bgnd_rules_mask,
                                tally_border_rules_mask              : parameters.pip_configuration.tally_lamps_right.cells[0].tally_border_rules_mask                               
                            }
                        ]
                        }                                    
            layout.children.push(tally_lamp);
            if(parameters.pip_configuration.tally_lamps_right.cells.length > 1)
            {
                let tally_lamp = {
                        db_schema         : 'video',
                        db_table          : 'multiviewer_layout_tally_lamps',
                        db_table_records  :
                                [
                                    {                            
                                        parent_video_source_on_parent_id     : pip_id,
                                        on_parent_id_index                   : 3,
                                        style_top                            : tally_lamps_right_y_second,
                                        style_left                           : tally_lamps_right_x_second,
                                        style_width                          : tally_lamps_right_width_second,
                                        style_height                         : tally_lamps_right_height_second,
                                        style_z_index                        : 1,
                                        style_border_width                   : parameters.pip_configuration.tally_lamps_right.cells[1].style_border_width, 
                                        style_border_color                   : parameters.pip_configuration.tally_lamps_right.cells[1].style_border_color,                            
                                        style_bgnd_color                     : parameters.pip_configuration.tally_lamps_right.cells[1].style_bgnd_color,                                                                                                                                                                          
                                        style_opacity                        : parameters.pip_configuration.tally_lamps_right.cells[1].style_opacity,  
                                        style_border_top_left_radius         : parameters.pip_configuration.tally_lamps_right.cells[1].style_border_top_left_radius,
                                        style_border_top_right_radius        : parameters.pip_configuration.tally_lamps_right.cells[1].style_border_top_right_radius,
                                        style_border_bottom_left_radius      : parameters.pip_configuration.tally_lamps_right.cells[1].style_border_bottom_left_radius,
                                        style_border_bottom_right_radius     : parameters.pip_configuration.tally_lamps_right.cells[1].style_border_bottom_right_radius,
                                        tally_bgnd_rules_mask                : parameters.pip_configuration.tally_lamps_right.cells[1].tally_bgnd_rules_mask,
                                        tally_border_rules_mask              : parameters.pip_configuration.tally_lamps_right.cells[1].tally_border_rules_mask                                                                              
                                    }
                                ]
                                }                                    
                layout.children.push(tally_lamp);
            }
        }
    //umd
    if(parameters.pip_configuration.umd != null)
    {               
        let umd_geometry =
        {
            x       : umd_x,
            y       : umd_y,
            width   : umd_width,
            height  : umd_height
        };        
        generate_md(pip_id,umd_geometry,parameters.pip_configuration.umd,layout,parameters.pip_interwidget_gap_x_size,0);
    }    
    //omd
    if(parameters.pip_configuration.omd != null)
    {
        let omd_geometry =
        {
            x       : omd_x,
            y       : omd_y,
            width   : omd_width,
            height  : omd_height
        };        
        generate_md(pip_id,omd_geometry,parameters.pip_configuration.omd,layout,parameters.pip_interwidget_gap_x_size,3);
    }
    //left ppms
    if(parameters.pip_configuration.ppms_left != null)
    {
        let as_geometry =
        {
            x       : ppms_left_x,
            y       : ppms_left_y,
            width   : ppms_left_width,
            height  : ppms_left_height
        };        
        generate_audio_sources(pip_id,as_geometry,parameters.pip_configuration.ppms_left,layout,0);
    }
    //right ppms
    if(parameters.pip_configuration.ppms_right != null)
    {
        let as_geometry =
        {
            x       : ppms_right_x,
            y       : ppms_right_y,
            width   : ppms_right_width,
            height  : ppms_right_height
        };        
        generate_audio_sources(pip_id,as_geometry,parameters.pip_configuration.ppms_right,layout,1);
    }
    //digital_clock
    //for now just one position under omd (SKY case)
    if(parameters.pip_configuration.digital_clock != null)
    {
        let digital_clock_y = omd_y + omd_height + parameters.pip_interwidget_gap_y_size;
        let digital_clock = {
            db_schema         : 'video',   
            db_table          : 'multiviewer_layout_digital_clocks', 
            db_table_records  :
            [
                {                         
                    parent_video_source_on_parent_id     : pip_id, 
                    style_top                            : digital_clock_y,
                    style_left                           : omd_x,
                    style_width                          : omd_width,
                    style_height                         : omd_height,
                    //--bgnd
                    style_bgnd_color                     : parameters.pip_configuration.digital_clock.style_bgnd_color, 
                    style_opacity                        : parameters.pip_configuration.digital_clock.style_opacity,
                    //--fgnd
                    style_color                          : parameters.pip_configuration.digital_clock.style_color,
                    style_font_opacity                   : parameters.pip_configuration.digital_clock.style_font_opacity
                }                                    
                ]       
        }
        layout.children.push(digital_clock);
    }
    
}

function generate_standard_layouts(parameters : any,layouts : any[])
{

    //console.log("-dbg-");
    //console.log(parameters);

    let layouts_description = [
        {name : "1-way",  size : 1},
        {name : "4-way",  size : 2},
        {name : "9-way",  size : 3},
        {name : "12-way", size : 4},         
        {name : "16-way", size : 4},
        {name : "25-way", size : 5},
        {name : "36-way", size : 6},
        {name : "49-way", size : 7},
        {name : "64-way", size : 8},
        {name : "81-way", size : 9},
        {name : "100-way", size : 10}
    ];    

    for(let i = 0; i < layouts_description.length;i++) 
    {        
        let layout = {
                db_schema               : 'video',   
                db_table                : 'multiviewer_layouts', 
                db_table_records        :
                [
                    {
                        name                : layouts_description[i].name + ' ' + parameters.pip_configuration.name,
                        style_bgnd_color    : parameters.layout_style_bgnd_color,
                        video_raster_id     : parameters.video_raster_id,
                        video_raster_width  : parameters.video_raster_width,
                        video_raster_height : parameters.video_raster_height                                
                    }                                    
                ],
                children    : <any>[],
                x           : 0,
                y           : 0
             } 
        
        let screen_width    = (parameters.video_raster_width  - ((parameters.edge_gap_x_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_x_size));
        let screen_height   = (parameters.video_raster_height - ((parameters.edge_gap_y_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_y_size));        
        let pip_width       = screen_width/layouts_description[i].size; 
        let pip_height      = screen_height/layouts_description[i].size;


        let rows_num = layouts_description[i].size;
        if(layouts_description[i].name == "12-way")
        {
            rows_num = 3;
        }        
        let pip_id = 0;
        for(let row = 0; row < rows_num;row++)
        {
            for(let col = 0; col < layouts_description[i].size;col++)
            {
                    let pip_geometry =
                    {
                        x       : (parameters.edge_gap_x_size + col*(pip_width+parameters.interpip_gap_x_size)),
                        y       : (parameters.edge_gap_y_size + row*(pip_height+parameters.interpip_gap_y_size)),
                        width   : pip_width,
                        height  : pip_height
                    };
                let skip = false;
                if(layouts_description[i].name == "1-way")
                {
                    if(parameters.pip_configuration.full_size_1_way==true)
                    {
                        let parameters_copy                                     = clone(parameters);    
                        pip_geometry.x                                          = 0;
                        pip_geometry.y                                          = 0;
                        pip_geometry.width                                      = parameters.video_raster_width;
                        pip_geometry.height                                     = parameters.video_raster_height;
                        
                        parameters_copy.pip_configuration.omd                   = null;
                        parameters_copy.pip_configuration.umd                   = null;                
                        parameters_copy.pip_configuration.tally_lamps_left      = null;
                        parameters_copy.pip_configuration.tally_lamps_right     = null;
                        parameters_copy.pip_configuration.ppms_left             = null;
                        parameters_copy.pip_configuration.ppms_right            = null;

                        //
                        parameters_copy.edge_gap_x_size                         = 0;
                        parameters_copy.edge_gap_y_size                         = 0;
                        parameters_copy.interpip_gap_x_size                     = 0;
                        parameters_copy.interpip_gap_y_size                     = 0;
                        //
                        parameters_copy.pip_edge_gap_x_size                     = 0;
                        parameters_copy.pip_edge_gap_y_size                     = 0;
                        parameters_copy.pip_interwidget_gap_x_size              = 0;
                        parameters_copy.pip_interwidget_gap_y_size              = 0;
                        //
                        //console.log(parameters_copy);
                        generate_pip(pip_id++,pip_geometry,parameters_copy,layout);
                        skip = true;                        
                    }
                }
                if(!skip)
                {
                    generate_pip(pip_id++,pip_geometry,parameters,layout);
                }            
            }
        }
        layouts.push(layout);        
    }    
}  

function generate_layouts(parameters : any ,layouts : any[])
{
    let layouts_description = [
        {name : "6-way A",        size : 3, mode : "skip", tr : 0, br : 1, lc : 1, rc : 2},  
        {name : "6-way B",        size : 3, mode : "skip", tr : 0, br : 1, lc : 0, rc : 1},
        {name : "6-way C",        size : 3, mode : "skip", tr : 1, br : 2, lc : 1, rc : 2},
        {name : "6-way D",        size : 3, mode : "skip", tr : 1, br : 2, lc : 0, rc : 1},
        //
        {name : "7-way A",        size : 4, mode : "insert", tr : 0, br : 1, lc : 2, rc : 3},  
        {name : "7-way B",        size : 4, mode : "insert", tr : 0, br : 1, lc : 0, rc : 1},
        {name : "7-way C",        size : 4, mode : "insert", tr : 2, br : 3, lc : 2, rc : 3},
        {name : "7-way D",        size : 4, mode : "insert", tr : 2, br : 3, lc : 0, rc : 1},
        //
        {name : "8-way A",        size : 4, mode : "skip", tr : 0, br : 2, lc : 1, rc : 3},  
        {name : "8-way B",        size : 4, mode : "skip", tr : 0, br : 2, lc : 0, rc : 2},
        {name : "8-way C",        size : 4, mode : "skip", tr : 1, br : 3, lc : 1, rc : 3},
        {name : "8-way D",        size : 4, mode : "skip", tr : 1, br : 3, lc : 0, rc : 2},
        //
        {name : "10-way Top",     size : 4, mode : "skip", tr : 0, br : 1, lc : 0, rc : 3},  
        {name : "10-way Centre",  size : 4, mode : "skip", tr : 1, br : 2, lc : 0, rc : 3},
        {name : "10-way Bottom",  size : 4, mode : "skip", tr : 2, br : 3, lc : 0, rc : 3},
        {name : "10-way Left",    size : 4, mode : "skip", tr : 0, br : 3, lc : 0, rc : 1},
        {name : "10-way Right",   size : 4, mode : "skip", tr : 0, br : 3, lc : 2, rc : 3},
        //
        {name : "13-way A",       size : 4, mode : "skip", tr : 0, br : 1, lc : 2, rc : 3},  
        {name : "13-way B",       size : 4, mode : "skip", tr : 0, br : 1, lc : 0, rc : 1},
        {name : "13-way C",       size : 4, mode : "skip", tr : 2, br : 3, lc : 2, rc : 3},
        {name : "13-way D",       size : 4, mode : "skip", tr : 2, br : 3, lc : 0, rc : 1}
    ];   

    for(let i = 0; i < layouts_description.length;i++) 
    {
        let layout = {
            db_schema               : 'video',   
            db_table                : 'multiviewer_layouts', 
            db_table_records        :
                [
                   {
                      name                : layouts_description[i].name + ' ' + parameters.pip_configuration.name,
                      style_bgnd_color    : parameters.layout_style_bgnd_color,
                      video_raster_id     : parameters.video_raster_id,
                      video_raster_width  : parameters.video_raster_width,
                      video_raster_height : parameters.video_raster_height                                
                   }                                    
                ],
                children    : <any>[],
                x           : 0,
                y           : 0
            } 
        
        let screen_width    = (parameters.video_raster_width  - ((parameters.edge_gap_x_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_x_size));
        let screen_height   = (parameters.video_raster_height - ((parameters.edge_gap_y_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_y_size));        
        let pip_width       = screen_width/layouts_description[i].size; 
        let pip_height      = screen_height/layouts_description[i].size;        
        
        let pip_id = 0;
        //large pips
        {
            //6,8,13 ways
            if(((i >= 0)  && (i <= 3))  ||
               ((i >= 8)  && (i <= 11)) ||
               ((i >= 17) && (i <= 20))
            )               
            {             

                let large_pip_width  = (layouts_description[i].size == 3) ? (2*pip_width  +  parameters.interpip_gap_x_size) : (3*pip_width +  2*parameters.interpip_gap_x_size);
                let large_pip_height = (layouts_description[i].size == 3) ? (2*pip_height +  parameters.interpip_gap_y_size) : (3*pip_height +  2*parameters.interpip_gap_y_size);
                if((i >= 17) && (i <= 20))
                {
                    large_pip_width  = 2*pip_width  +  parameters.interpip_gap_x_size;
                    large_pip_height = 2*pip_height +  parameters.interpip_gap_y_size;
                }

                let pip_geometry =
                    {
                        x       : (parameters.edge_gap_x_size + layouts_description[i].lc*(pip_width+parameters.interpip_gap_x_size)),
                        y       : (parameters.edge_gap_y_size + layouts_description[i].tr*(pip_height+parameters.interpip_gap_y_size)),
                        width   : large_pip_width,
                        height  : large_pip_height
                    };
                generate_pip(pip_id++,pip_geometry,parameters,layout);     
            }
            //7,10 ways
            let large_pip_width  = 2*pip_width  + parameters.interpip_gap_x_size;
            let large_pip_height = 2*pip_height + parameters.interpip_gap_y_size;
            if(((i >= 4)  && (i <= 7)))
            {                
                for(let row = 0; row < 2;row++)
                {
                    for(let col = 0; col < 2;col++)
                    {
                        let pip_geometry =
                        {
                            x       : (parameters.edge_gap_x_size + col*(large_pip_width  + parameters.interpip_gap_x_size)),
                            y       : (parameters.edge_gap_y_size + row*(large_pip_height + parameters.interpip_gap_y_size)),
                            width   : large_pip_width,
                            height  : large_pip_height
                        };
                        if(!((row == layouts_description[i].tr/2) && (col == layouts_description[i].lc/2)))
                        {
                            generate_pip(pip_id++,pip_geometry,parameters,layout);     
                        }
                    }
                }
            }
            if((i >= 12) && (i <= 16))
            {
                for(let j = 0; j < 2;j++)
                {
                    let pip_geometry =
                    {
                        x       : (parameters.edge_gap_x_size + j*(large_pip_width  + parameters.interpip_gap_x_size)),
                        y       : (parameters.edge_gap_y_size + j*(large_pip_height + parameters.interpip_gap_y_size)),
                        width   : large_pip_width,
                        height  : large_pip_height
                    };
                    if((i >= 12) && (i<=14))
                    {
                        pip_geometry.y = parameters.edge_gap_y_size + layouts_description[i].tr*pip_height + ((layouts_description[i].tr>0) ? parameters.interpip_gap_y_size : 0);                             
                    }else{
                        pip_geometry.x = parameters.edge_gap_x_size + layouts_description[i].lc*(pip_width+parameters.interpip_gap_x_size);
                    }
                    generate_pip(pip_id++,pip_geometry,parameters,layout);
                }
            }
        }
        //small pips
        {    
            for(let row = 0; row < layouts_description[i].size;row++)
            {
                for(let col = 0; col < layouts_description[i].size;col++)
                {
                    let pip_geometry =
                    {
                        x       : (parameters.edge_gap_x_size + col*(pip_width+parameters.interpip_gap_x_size)),
                        y       : (parameters.edge_gap_y_size + row*(pip_height+parameters.interpip_gap_y_size)),
                        width   : pip_width,
                        height  : pip_height
                    };
                    let insert = true;                           
                    if(layouts_description[i].mode == "skip")
                    {
                        if((row >= layouts_description[i].tr) && (row <= layouts_description[i].br) && (col >= layouts_description[i].lc) && (col <= layouts_description[i].rc))
                        {
                            insert = false;
                        } else {
                            insert = true;
                        }                                 
                    } else {
                        if((row >= layouts_description[i].tr) && (row <= layouts_description[i].br) && (col >= layouts_description[i].lc) && (col <= layouts_description[i].rc))
                        {
                            insert = true;
                        } else {
                            insert = false;
                        }  
                    }   
                    if(insert)
                    {           
                        generate_pip(pip_id++,pip_geometry,parameters,layout);            
                    }
                }
            }
        }
        layouts.push(layout);
    }    
}

function generate_remote_layouts(parameters : any,layouts : any[])
{
    let layouts_description = [
        {name : "43-way",        size : 6, large_rows : 4, small_columns : 9, small_rows : 3},  
        {name : "63-way",        size : 6, large_rows : 3, small_columns : 9, small_rows : 5}       
    ];   

    for(let i = 0; i < layouts_description.length;i++) 
    {
            let layout = {
                db_schema               : 'video',   
                db_table                : 'multiviewer_layouts', 
                db_table_records        :
                    [
                       {
                          name                : layouts_description[i].name + ' ' + parameters.pip_configuration.name,
                          style_bgnd_color    : parameters.layout_style_bgnd_color,
                          video_raster_id     : parameters.video_raster_id,
                          video_raster_width  : parameters.video_raster_width,
                          video_raster_height : parameters.video_raster_height                                
                       }                                    
                    ],
                    children    : <any>[],
                    x           : 0,
                    y           : 0
                } 
            
            let screen_width        = (parameters.video_raster_width  - ((parameters.edge_gap_x_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_x_size));
            let screen_height       = (parameters.video_raster_height - ((parameters.edge_gap_y_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_y_size));        
            let large_pip_width     = screen_width/layouts_description[i].size; 
            let large_pip_height    = screen_height/layouts_description[i].size;
            let small_pips_start    = (parameters.edge_gap_y_size + layouts_description[i].large_rows*(large_pip_height+parameters.interpip_gap_y_size))-parameters.interpip_gap_y_size;
                         
            let pip_id = 0;
            //large pips
            {                   
                for(let row = 0; row < layouts_description[i].large_rows;row++)
                {
                    for(let col = 0; col < layouts_description[i].size;col++)
                    {
                        let pip_geometry =
                        {
                            x       : (parameters.edge_gap_x_size + col*(large_pip_width+parameters.interpip_gap_x_size)),
                            y       : (parameters.edge_gap_y_size + row*(large_pip_height+parameters.interpip_gap_y_size)),
                            width   : large_pip_width,
                            height  : large_pip_height
                        };                                                
                        generate_pip(pip_id++,pip_geometry,parameters,layout);
                    }
                }
            }
            //small pips
            {                
                let small_screen_width     = (parameters.video_raster_width  - ((parameters.edge_gap_x_size*2) + (layouts_description[i].small_columns-1)*parameters.interpip_gap_x_size));
                let small_screen_height    = (parameters.video_raster_height - small_pips_start) - (parameters.edge_gap_y_size*2 + (layouts_description[i].small_rows-1)*parameters.interpip_gap_y_size);   
                let small_pip_width        = small_screen_width/layouts_description[i].small_columns; 
                let small_pip_height       = small_screen_height/layouts_description[i].small_rows;

                for(let row = 0; row < layouts_description[i].small_rows;row++)
                {
                    for(let col = 0; col < layouts_description[i].small_columns;col++)
                    {
                        let pip_geometry =
                        {
                            x       : (parameters.edge_gap_x_size + col*(small_pip_width+parameters.interpip_gap_x_size)),
                            y       : (small_pips_start + parameters.edge_gap_y_size + row*(small_pip_height+parameters.interpip_gap_y_size)),
                            width   : small_pip_width,
                            height  : small_pip_height
                        };                                                
                        generate_pip(pip_id++,pip_geometry,parameters,layout);
                    }
                }
            }
            layouts.push(layout);    
    }
}

function pips_helper(pip_id_object : {pip_id : number},layout_description : any,parameters : any,layout : any, pip_width : any, pip_height : any, offset_x : any, offset_y : any)
{          
    for(let row = 0; row < layout_description.size_v;row++)
    {
        for(let col = 0; col < layout_description.size;col++)
        {
            let pip_geometry =
            {
                    x       : (parameters.edge_gap_x_size + offset_x + col*(pip_width+parameters.interpip_gap_x_size)),
                    y       : (parameters.edge_gap_y_size + offset_y + row*(pip_height+parameters.interpip_gap_y_size)),
                    width   : pip_width,
                    height  : pip_height
            };
            let insert = true;                           
            if(layout_description.mode == "skip")
            {
                if((row >= layout_description.tr) && (row <= layout_description.br) && (col >= layout_description.lc) && (col <= layout_description.rc))
                {
                    insert = false;
                } else {
                    insert = true;
                }                                 
            } 
            if(layout_description.mode == "insert")
            {
                insert = false;     
                if((row >= layout_description.tr) && (row <= layout_description.br) && (col >= layout_description.lc) && (col <= layout_description.rc))
                {
                    insert = true;
                } 
            }
            if(insert)
            {           
                generate_pip(pip_id_object.pip_id++,pip_geometry,parameters,layout);                           
            }
        }
    }
}

function generate_director_layouts(parameters : any,layouts : any[])
{
    let layouts_description = [
        {name : "Director 6-way", size : 4, size_v : 4,mode : "skip", tr : 1, br : 3, lc : 0, rc : 3},  
        {name : "Director 7-way", size : 4, size_v : 4,mode : "skip", tr : 1, br : 3, lc : 0, rc : 3}       
    ];   
    
    for(let i = 0; i < layouts_description.length;i++) 
    {
        let layout = {
            db_schema               : 'video',   
            db_table                : 'multiviewer_layouts', 
            db_table_records        :
                [
                    {
                        name                : layouts_description[i].name + ' ' + parameters.pip_configuration.name,
                        style_bgnd_color    : parameters.layout_style_bgnd_color,
                        video_raster_id     : parameters.video_raster_id,
                        video_raster_width  : parameters.video_raster_width,
                        video_raster_height : parameters.video_raster_height                                
                    }                                    
                ],
                children    : <any>[],
                x           : 0,
                y           : 0
            } 
        
        let screen_width      = (parameters.video_raster_width  - ((parameters.edge_gap_x_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_x_size));
        let screen_height     = (parameters.video_raster_height - ((parameters.edge_gap_y_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_y_size));        
        let pip_width         = screen_width/layouts_description[i].size; 
        let pip_height        = screen_height/layouts_description[i].size;   
        let large_pip_width   = (pip_width*2) + (pip_width/2) + parameters.interpip_gap_x_size*2;
        let large_pip_height  = pip_height*3 + parameters.interpip_gap_y_size*2;    
        let mid_pip_width     = (pip_width*1) + (pip_width/2);// + parameters.interpip_gap_x_size*1;
        let mid_pip_height    = pip_height*1 + (pip_height/2);// + parameters.interpip_gap_y_size*1;            
        let pip_id            = {pip_id : 0};    
        //large pip    
        {    
            let large_description = { size : 1 , size_v : 1 , mode : "none"};                    
            pips_helper(pip_id,large_description,parameters,layout,large_pip_width,large_pip_height,0,pip_height + parameters.interpip_gap_y_size);
            //console.log(pip_id);
        }
        //mid pips
        {
            let mid_description = { size : 1 , size_v : 2 , mode : "none",tr : 0, br : 0, lc : 0, rc : 0}; 
            if(i == 0)
            {
                mid_description.mode = "skip";
            }
            pips_helper(pip_id,mid_description,parameters,layout,mid_pip_width,mid_pip_height, large_pip_width + parameters.interpip_gap_x_size,pip_height + parameters.interpip_gap_y_size);
            //console.log(pip_id);
        }    
        //small pips
        {    
            pips_helper(pip_id,layouts_description[i],parameters,layout,pip_width,pip_height,0,0);
            //console.log(pip_id);
        }    

        layouts.push(layout);            
    }
}

function generate_director_layouts2(parameters : any,layouts : any[])
{
    let layouts_description = [
        {name : "Director 4-way left",  size : 2, size_v : 2,mode : "skip", tr : 1, br : 1, lc : 0, rc : 1}, 
        {name : "Director 4-way",       size : 2, size_v : 2,mode : "skip", tr : 1, br : 1, lc : 0, rc : 1},  
        {name : "Director 6-way left",  size : 4, size_v : 4,mode : "skip", tr : 1, br : 3, lc : 0, rc : 3},
        {name : "Director 6-way right", size : 4, size_v : 4,mode : "skip", tr : 1, br : 3, lc : 0, rc : 3},
        {name : "Director 7-way left",  size : 4, size_v : 4,mode : "skip", tr : 1, br : 3, lc : 0, rc : 3},
        {name : "Director 7-way right", size : 4, size_v : 4,mode : "skip", tr : 1, br : 3, lc : 0, rc : 3},
        {name : "Director 10-way left", size : 4, size_v : 4,mode : "skip", tr : 2, br : 3, lc : 0, rc : 3},
        {name : "Director 10-way right", size : 4, size_v : 4,mode : "skip", tr : 2, br : 3, lc : 0, rc : 3},

    ];   
    

    let parameters_no_widgets                                                                    = clone(parameters);                                                   
    parameters_no_widgets.pip_configuration.omd                                                  = null;
    parameters_no_widgets.pip_configuration.umd                                                  = null;                
    parameters_no_widgets.pip_configuration.tally_lamps_left                                     = null;
    parameters_no_widgets.pip_configuration.tally_lamps_right                                    = null;
    parameters_no_widgets.pip_configuration.ppms_left                                            = null;
    parameters_no_widgets.pip_configuration.ppms_right                                           = null;
    parameters_no_widgets.pip_configuration.digital_clock                                        = null;
    let parameters_no_widgets_red_border                                                         = clone(parameters_no_widgets);
    parameters_no_widgets_red_border.pip_configuration.video_source.border_alignment             = 'inside';//outside     
    parameters_no_widgets_red_border.pip_configuration.video_source.style_border_width           = 4;
    parameters_no_widgets_red_border.pip_configuration.video_source.style_border_color           = 'red';
    parameters_no_widgets_red_border.pip_configuration.video_source.tally_border_rules_mask      = 0;

    for(let i = 0; i < layouts_description.length;i++) 
    {
        let layout = {
            db_schema               : 'video',   
            db_table                : 'multiviewer_layouts', 
            db_table_records        :
                [
                    {
                        name                : layouts_description[i].name + ' ' + parameters.pip_configuration.name,
                        style_bgnd_color    : parameters.layout_style_bgnd_color,
                        video_raster_id     : parameters.video_raster_id,
                        video_raster_width  : parameters.video_raster_width,
                        video_raster_height : parameters.video_raster_height                                
                    }                                    
                ],
                children    : <any>[],
                x           : 0,
                y           : 0
            } 
        
        let screen_width                 = (parameters.video_raster_width  - ((parameters.edge_gap_x_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_x_size));
        let screen_height                = (parameters.video_raster_height - ((parameters.edge_gap_y_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_y_size));        
        let pip_width                    = screen_width/layouts_description[i].size; 
        let pip_height                   = screen_height/layouts_description[i].size;   
        let large_pip_width              = round_to_even(screen_width*0.625);
        let large_pip_height             = round_to_even((large_pip_width*9)/16);    
        //let large_pip_width              = (pip_width*2) + (pip_width/2) + parameters.interpip_gap_x_size*2;
        //let large_pip_height             = pip_height*3 + parameters.interpip_gap_y_size*2;    
        let mid_pip_width                = (pip_width*1) + (pip_width/2);
        let mid_pip_height               = pip_height*1 + (pip_height/2);
        let mid_pip_x                    = 0;
        let mid_pip_y                    = 0;  
        let large_pip_add                = false;      
        let large_pip_with_red_border    = false;         
        let pip_x_offset                 = 0;
        let pip_y_offset                 = 0;
        let mid_pips_num                 = 0;     
        let pip_id            = {pip_id : 0};    

        
        let large_pip_geometry =
        {
                x       : 0,
                y       : 0,
                width   : large_pip_width,
                height  : large_pip_height
        };
        
        
        if((i < 2) || (i >= 6) && (i <= 7))//"Director 4-way left", "Director 4-way",
        {
            let l_pip_width  = pip_width;
            let l_pip_height = pip_height;
            let l_pip_x_offset = 0;

            if((i >= 6) && (i <= 7))
            {
                l_pip_width   = screen_width/2; 
                l_pip_height  = screen_height/2;   
                l_pip_x_offset = parameters.edge_gap_x_size;
            }

            if((i == 0) || (i == 6))
            {
                let nw_description = { size : 2 , size_v : 2 , mode : "insert",tr : 1, br : 1, lc : 0, rc : 0};                         
                pips_helper(pip_id,nw_description,parameters_no_widgets_red_border,layout,l_pip_width,l_pip_height,l_pip_x_offset,0);
                nw_description = { size : 2 , size_v : 2 , mode : "insert",tr : 1, br : 1, lc : 1, rc : 1};
                pips_helper(pip_id,nw_description,parameters_no_widgets,layout,l_pip_width,l_pip_height,l_pip_x_offset,0);
            } else {
                let nw_description = { size : 2 , size_v : 2 , mode : "skip",tr : 0, br : 0, lc : 0, rc : 1};                         
                pips_helper(pip_id,nw_description,parameters_no_widgets,layout,l_pip_width,l_pip_height,l_pip_x_offset,0);
            }
        }
        if((i >= 2) && (i <= 5))//"Director 6-way left","Director 6-way right",//"Director 7-way left","Director 7-way right"
        {           
            large_pip_add  = true;
            
            if((i >= 2) && (i <= 3))
            {
                pip_y_offset          = round_to_even(((screen_height - large_pip_height) - pip_height)/2);
                mid_pips_num = 1;
            } else {
                mid_pips_num = 2;
            }
            large_pip_geometry.y = (parameters.video_raster_height - large_pip_height - parameters.edge_gap_y_size - 1);
            if((i == 2) || (i==4))
            {
                large_pip_with_red_border = true;
                large_pip_geometry.x    = parameters.edge_gap_x_size;   
               
            } else {
                large_pip_geometry.x    = (parameters.video_raster_width - large_pip_width - parameters.edge_gap_x_size - 1);                
            }
                     
            mid_pip_height = round_to_even(((large_pip_geometry.y + large_pip_geometry.height) - (pip_y_offset*0 + pip_height) - parameters.interpip_gap_y_size*2) / 2);
            mid_pip_width  = screen_width - large_pip_width - parameters.interpip_gap_x_size;
            mid_pip_x      = ((i == 2) || (i==4)) ?  parameters.edge_gap_x_size + large_pip_width + parameters.interpip_gap_x_size : parameters.edge_gap_x_size;
            mid_pip_y      = pip_y_offset*0 + pip_height + parameters.interpip_gap_y_size;  


        }
        //large pip
        if(large_pip_add)
        {
            generate_pip(pip_id.pip_id++,large_pip_geometry,large_pip_with_red_border ?  parameters_no_widgets_red_border : parameters_no_widgets,layout);  
        }
        //mid pip       
        if(mid_pips_num > 0)
        {
            let mid_description = { size : 1 , size_v : 2 , mode : "none",tr : 0, br : 0, lc : 0, rc : 0}; 
            if(mid_pips_num == 1)
            {
                mid_description.mode = "skip";
            }
            pips_helper(pip_id,mid_description,parameters,layout,
                mid_pip_width,
                mid_pip_height, 
                mid_pip_x,
                mid_pip_y
            );
        }

        //small pips
        {    
            pips_helper(pip_id,layouts_description[i],parameters,layout,pip_width,pip_height,pip_x_offset,pip_y_offset);
            //console.log(pip_id);
        }   
        //digital clock
        if((i >= 2) && (i <= 3)) 
        {

           let digital_clock_height = (round_to_even(mid_pip_height * 0.3)); 
           let digital_clock_y      = large_pip_geometry.y;
           
        
            let digital_clock = {
                db_schema         : 'video',   
                db_table          : 'multiviewer_layout_digital_clocks', 
                db_table_records  :
                [
                    {                         
                        
                        style_top                            : digital_clock_y,
                        style_left                           : mid_pip_x,
                        style_width                          : mid_pip_width,
                        style_height                         : digital_clock_height/*,
                        //--bgnd
                        style_bgnd_color                     : ?, 
                        style_opacity                        : ?,
                        //--fgnd
                        style_color                          : ?,
                        style_font_opacity                   : ?
                        */
                    }                                    
                ]       
            };
            layout.children.push(digital_clock);
        }

        layouts.push(layout);            
    }
}

function generate_vt_coord_layouts(parameters : any,layouts : any[])
{
    let layouts_description = [
        {name : "VT Coord 12-way Top",              size : 5, size_v : 5, mode : "skip", tr : 0, br : 2, lc : 0, rc : 4},  
        {name : "VT Coord 12-way Centre",           size : 5, size_v : 5, mode : "skip", tr : 1, br : 3, lc : 0, rc : 4},
        {name : "VT Coord 12-way Bottom",           size : 5, size_v : 5, mode : "skip", tr : 2, br : 4, lc : 0, rc : 4},   
        {name : "VT Coord 13-way Big Centre",       size : 4, size_v : 4, mode : "skip", tr : 1, br : 2, lc : 1, rc : 2},
        {name : "VT Coord 19-way Top",              size : 5, size_v : 4, mode : "skip", tr : 2, br : 3, lc : 1, rc : 3},
        {name : "VT Coord 24-way Top",              size : 5, size_v : 5, mode : "skip", tr : 4, br : 4, lc : 0, rc : 4},
        {name : "VT Coord 25-way Big Centre",       size : 6, size_v : 4, mode : "skip", tr : 2, br : 3, lc : 2, rc : 3},
        {name : "VT Coord 31-way Big Centre",       size : 6, size_v : 5, mode : "skip", tr : 3, br : 4, lc : 2, rc : 3},
        {name : "VT Coord 31-way Very Big Centre",  size : 7, size_v : 5, mode : "skip", tr : 2, br : 4, lc : 2, rc : 4},
        {name : "VT Coord 34-way",                  size : 6, size_v : 6, mode : "skip", tr : 5, br : 5, lc : 0, rc : 5}
    ]; 

    for(let i = 0; i < layouts_description.length;i++) 
    {
        let layout = {
                db_schema               : 'video',   
                db_table                : 'multiviewer_layouts', 
                db_table_records        :
                    [
                        {
                            name                : layouts_description[i].name + ' ' + parameters.pip_configuration.name,
                            style_bgnd_color    : parameters.layout_style_bgnd_color,
                            video_raster_id     : parameters.video_raster_id,
                            video_raster_width  : parameters.video_raster_width,
                            video_raster_height : parameters.video_raster_height                                
                        }                                    
                    ],
                    children    : <any>[],
                    x           : 0,
                    y           : 0
            } 
            
        let screen_width    = (parameters.video_raster_width  - ((parameters.edge_gap_x_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_x_size));
        let screen_height   = (parameters.video_raster_height - ((parameters.edge_gap_y_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_y_size));        
        let pip_width       = screen_width/layouts_description[i].size; 
        let pip_height      = screen_height/layouts_description[i].size;     
        let pip_id            = {pip_id : 0}; 
        //large pips
        {            
            if((i >= 0) && (i <= 2))//VT Coord 12-way Top,Center,Bottom
            {
                let large_pip_width   = (pip_width*2) + (pip_width/2) + parameters.interpip_gap_x_size*1;
                let large_pip_height  = pip_height*3 + parameters.interpip_gap_y_size*2;
                let large_description = { size : 2 , size_v : 1 , mode : "none"};
                let v_offset = i*(pip_height + parameters.interpip_gap_y_size);                
                pips_helper(pip_id,large_description,parameters,layout,large_pip_width,large_pip_height,0,v_offset);
            }else            
            if(i == 3)//VT Coord 13-way Big Centre
            {
                let large_pip_width   = (pip_width*2) + parameters.interpip_gap_x_size*1;
                let large_pip_height  = (pip_height*2) + parameters.interpip_gap_y_size*1;
                let large_description = { size : 1 , size_v : 1 , mode : "none"};
                let h_offset          = (pip_width + parameters.interpip_gap_x_size);
                let v_offset          = (pip_height + parameters.interpip_gap_y_size);                
                pips_helper(pip_id,large_description,parameters,layout,large_pip_width,large_pip_height,h_offset,v_offset);
            }else
            if(i == 4)//VT Coord 19-way Top
            {
                let large_pip_width   = (pip_width*2) + parameters.interpip_gap_x_size*1;
                let large_pip_height  = (pip_height*2) + parameters.interpip_gap_y_size*1;
                let large_description = { size : 1 , size_v : 1 , mode : "none"};
                let h_offset          = (pip_width + pip_width/2 + parameters.interpip_gap_x_size);
                let v_offset          = (pip_height + parameters.interpip_gap_y_size)*2;                
                pips_helper(pip_id,large_description,parameters,layout,large_pip_width,large_pip_height,h_offset,v_offset);
                //
                let small_description = { size : 4 , size_v : 1 , mode : "none"};
                h_offset          = pip_width/2;
                v_offset          = (pip_height + parameters.interpip_gap_y_size)*4; 
                pips_helper(pip_id,small_description,parameters,layout,pip_width,pip_height,h_offset,v_offset);
            }else
            if(i == 5)//VT Coord 24-way Top
            {                                
                let small_description = { size : 4 , size_v : 1 , mode : "none"};
                let h_offset          = pip_width/2;
                let v_offset          = (pip_height + parameters.interpip_gap_y_size)*4; 
                pips_helper(pip_id,small_description,parameters,layout,pip_width,pip_height,h_offset,v_offset);
            }else
            if(i == 6)//VT Coord 25-way Big Centre
            {
                let large_pip_width   = (pip_width*2) + parameters.interpip_gap_x_size*1;
                let large_pip_height  = (pip_height*2) + parameters.interpip_gap_y_size*1;
                let large_description = { size : 1 , size_v : 1 , mode : "none"};
                let h_offset          = (pip_width + parameters.interpip_gap_x_size)*2;
                let v_offset          = (pip_height + parameters.interpip_gap_y_size)*2;                
                pips_helper(pip_id,large_description,parameters,layout,large_pip_width,large_pip_height,h_offset,v_offset);
                //
                let mid_description   = { size : 4 , size_v : 1 , mode : "none"};
                let mid_screen_width  = (parameters.video_raster_width  - ((parameters.edge_gap_x_size*2) + 3*parameters.interpip_gap_x_size));
                let mid_pip_width     = mid_screen_width/4;
                let mid_pip_height    = (mid_pip_width*9)/16;    
                h_offset              = 0;
                v_offset              = (pip_height + parameters.interpip_gap_y_size)*4 + (2*pip_height + parameters.interpip_gap_y_size - mid_pip_height)/2; 
                pips_helper(pip_id,mid_description,parameters,layout,mid_pip_width,mid_pip_height,h_offset,v_offset);
            }else
            if(i == 7)//VT Coord 31-way Big Centre
            {
                let large_pip_width   = (pip_width*2) + parameters.interpip_gap_x_size*1;
                let large_pip_height  = (pip_height*2) + parameters.interpip_gap_y_size*1;
                let large_description = { size : 1 , size_v : 1 , mode : "none"};
                let h_offset          = (pip_width + parameters.interpip_gap_x_size)*2;
                let v_offset          = (pip_height + parameters.interpip_gap_y_size)*3;                
                pips_helper(pip_id,large_description,parameters,layout,large_pip_width,large_pip_height,h_offset,v_offset);
                //
                let small_description = { size : 4 , size_v : 1 , mode : "none"};
                h_offset          = (pip_width  + parameters.interpip_gap_x_size)*1;
                v_offset          = (pip_height + parameters.interpip_gap_y_size)*5; 
                pips_helper(pip_id,small_description,parameters,layout,pip_width,pip_height,h_offset,v_offset);                
            } else
            if(i == 8)//VT Coord 31-way Very Big Centre
            {
                let large_pip_width   = (pip_width*3) + parameters.interpip_gap_x_size*2;
                let large_pip_height  = (pip_height*3) + parameters.interpip_gap_y_size*2;
                let large_description = { size : 1 , size_v : 1 , mode : "none"};
                let h_offset          = (pip_width + parameters.interpip_gap_x_size)*2;
                let v_offset          = (pip_height + parameters.interpip_gap_y_size)*2;                
                pips_helper(pip_id,large_description,parameters,layout,large_pip_width,large_pip_height,h_offset,v_offset);
                //
                let mid_description   = { size : 4 , size_v : 1 , mode : "none"};
                let mid_screen_width  = (parameters.video_raster_width  - ((parameters.edge_gap_x_size*2) + 3*parameters.interpip_gap_x_size));
                let mid_pip_width     = mid_screen_width/4;
                let mid_pip_height    = (pip_height*2) + parameters.interpip_gap_y_size*1;    
                h_offset              = 0;
                v_offset              = (pip_height + parameters.interpip_gap_y_size)*5; 
                pips_helper(pip_id,mid_description,parameters,layout,mid_pip_width,mid_pip_height,h_offset,v_offset);
            }else
            if(i == 9)//VT Coord 34-way
            {
                let small_description = { size : 4 , size_v : 1 , mode : "none"};
                let h_offset          = (pip_width + parameters.interpip_gap_x_size)*1; 
                let v_offset          = (pip_height + parameters.interpip_gap_y_size)*5; 
                pips_helper(pip_id,small_description,parameters,layout,pip_width,pip_height,h_offset,v_offset);
            }
        }
        //small pips
        {    
            pips_helper(pip_id,layouts_description[i],parameters,layout,pip_width,pip_height,0,0);
        }    
    
        layouts.push(layout);            
    }
}

function generate_big_layouts(parameters : any,layouts : any[])
{
    let layouts_description = [
        {name : "1 big bottom - 28-way", size : 6, size_v : 6,mode : "skip", tr : 3, br : 5, lc : 3, rc : 5, large_pips_num : 1}, 
        
        {name : "1 big bottom - 27-way", size : 6, size_v : 6,mode : "skip", tr : 3, br : 5, lc : 0, rc : 2, large_pips_num : 1},         
        {name : "2 big bottom - 18-way", size : 6, size_v : 6,mode : "skip", tr : 3, br : 5, lc : 0, rc : 5, large_pips_num : 2}, 
        {name : "3 big bottom - 24-way", size : 6, size_v : 6,mode : "skip", tr : 4, br : 5, lc : 0, rc : 5, large_pips_num : 3}, 
        
        {name : "1 big bottom - 40-way", size : 7, size_v : 7,mode : "skip", tr : 4, br : 6, lc : 0, rc : 2, large_pips_num : 1},         
        {name : "2 big bottom - 21-way", size : 7, size_v : 7,mode : "skip", tr : 3, br : 6, lc : 0, rc : 6, large_pips_num : 2}, 
        {name : "3 big bottom - 28-way", size : 7, size_v : 7,mode : "skip", tr : 4, br : 6, lc : 0, rc : 6, large_pips_num : 3}, 

        
        {name : "1 big bottom - 48-way", size : 8, size_v : 8,mode : "skip", tr : 4, br : 7, lc : 0, rc : 3, large_pips_num : 1},         
        {name : "2 big bottom - 32-way", size : 8, size_v : 8,mode : "skip", tr : 4, br : 7, lc : 0, rc : 7, large_pips_num : 2}, 
        {name : "3 big bottom - 40-way", size : 8, size_v : 8,mode : "skip", tr : 5, br : 7, lc : 0, rc : 7, large_pips_num : 3}, 

        
        {name : "1 big bottom - 65-way", size : 9, size_v : 9,mode : "skip", tr : 5, br : 8, lc : 0, rc : 3, large_pips_num : 1},         
        {name : "2 big bottom - 36-way", size : 9, size_v : 9,mode : "skip", tr : 4, br : 8, lc : 0, rc : 8, large_pips_num : 2}, 
        {name : "3 big bottom - 54-way", size : 9, size_v : 9,mode : "skip", tr : 6, br : 8, lc : 0, rc : 8, large_pips_num : 3}, 
        
        {name : "1 big bottom - 75-way", size : 10, size_v : 10,mode : "skip", tr : 5, br : 9, lc : 0, rc : 4, large_pips_num : 1},         
        {name : "2 big bottom - 50-way", size : 10, size_v : 10,mode : "skip", tr : 5, br : 9, lc : 0, rc : 9, large_pips_num : 2}, 
        {name : "3 big bottom - 60-way", size : 10, size_v : 10,mode : "skip", tr : 6, br : 9, lc : 0, rc : 9, large_pips_num : 3}, 

        
        {name : "1 big bottom - 84-way", size : 10, size_v : 10,mode : "skip", tr : 6, br : 9, lc : 0, rc : 3, large_pips_num : 1},         
        {name : "1 big bottom - 91-way", size : 10, size_v : 10,mode : "skip", tr : 7, br : 9, lc : 0, rc : 2, large_pips_num : 1}
    ];   

    for(let i = 0; i < layouts_description.length;i++) 
    {
        let layout = {
                db_schema               : 'video',   
                db_table                : 'multiviewer_layouts', 
                db_table_records        :
                        [
                            {
                                name                : layouts_description[i].name + ' ' + parameters.pip_configuration.name,
                                style_bgnd_color    : parameters.layout_style_bgnd_color,
                                video_raster_id     : parameters.video_raster_id,
                                video_raster_width  : parameters.video_raster_width,
                                video_raster_height : parameters.video_raster_height                                
                            }                                    
                        ],
                        children    : <any>[],
                        x           : 0,
                        y           : 0
            }     
            
            let screen_width    = (parameters.video_raster_width  - ((parameters.edge_gap_x_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_x_size));
            let screen_height   = (parameters.video_raster_height - ((parameters.edge_gap_y_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_y_size));        
            let pip_width       = screen_width/layouts_description[i].size; 
            let pip_height      = screen_height/layouts_description[i].size;     
            let pip_id          = {pip_id : 0};                 

            let parameters_no_widgets                                                                        = clone(parameters);                                                   
                parameters_no_widgets.pip_configuration.omd                                                  = null;
                parameters_no_widgets.pip_configuration.umd                                                  = null;                
                parameters_no_widgets.pip_configuration.tally_lamps_left                                     = null;
                parameters_no_widgets.pip_configuration.tally_lamps_right                                    = null;
                parameters_no_widgets.pip_configuration.ppms_left                                            = null;
                parameters_no_widgets.pip_configuration.ppms_right                                           = null;
                parameters_no_widgets.pip_configuration.digital_clock                                        = null;

                      
            let not_active_rows     = ((layouts_description[i].br-layouts_description[i].tr)+1);                
            let active_rows         = layouts_description[i].size - not_active_rows;
            let large_pip_height    = round_to_even(pip_height*not_active_rows);    
            let large_pip_width     = round_to_even((large_pip_height*16)/9);
            let large_pip_x_offset  = parameters.edge_gap_x_size + layouts_description[i].lc * (pip_width + parameters.interpip_gap_x_size);
            let large_pip_y_offset  = parameters.edge_gap_y_size + layouts_description[i].tr * (pip_height + parameters.interpip_gap_y_size);

            if((large_pip_width*layouts_description[i].large_pips_num) > screen_width)
            {
                large_pip_width  = round_to_even(screen_width / (layouts_description[i].large_pips_num));
                large_pip_height = round_to_even((large_pip_width*9)/16);
                large_pip_y_offset = (large_pip_y_offset + round_to_even((screen_height - (large_pip_y_offset + large_pip_height))/2));
            }

            if(layouts_description[i].large_pips_num > 1)
            {
                large_pip_x_offset = round_to_even((screen_width - large_pip_width*layouts_description[i].large_pips_num)/(layouts_description[i].large_pips_num));                
            }

            let large_pip_geometry =
            {
                x       : large_pip_x_offset,
                y       : large_pip_y_offset,
                width   : large_pip_width,
                height  : large_pip_height
            };    

            //small pips
            {    
                pips_helper(pip_id,layouts_description[i],parameters,layout,pip_width,pip_height,0,0);
            }   

            //big pips
            {
                for(let j = 0; j < layouts_description[i].large_pips_num;j++)
                {
                    generate_pip(pip_id.pip_id++,large_pip_geometry,parameters_no_widgets,layout);  
                    large_pip_geometry.x += large_pip_width;
                    large_pip_geometry.x += large_pip_x_offset;
                }
            }
           

        layouts.push(layout);
    }
}

function generate_riot_layouts(parameters : any,layouts : any[])
{
    let layouts_description = [
        {name : "12+1TR",                       size : 4, size_v : 4,mode : "skip", tr : 0, br : 1, lc : 2, rc : 3, large_pips_num : 1},//0
        {name : "12+1TL",                       size : 4, size_v : 4,mode : "skip", tr : 0, br : 1, lc : 0, rc : 1, large_pips_num : 1},//1
        {name : "12+1BR",                       size : 4, size_v : 4,mode : "skip", tr : 2, br : 3, lc : 2, rc : 3, large_pips_num : 1},//2
        {name : "12+1BL",                       size : 4, size_v : 4,mode : "skip", tr : 2, br : 3, lc : 0, rc : 1, large_pips_num : 1},//3

        {name : "22 Channel",                   size : 5, size_v : 5,mode : "skip", tr : 3, br : 4, lc : 3, rc : 4, large_pips_num : 1},//4

        {name : "15 Channel + 2 Clocks TL",     size : 4, size_v : 4,mode : "skip", tr : 0, br : 0, lc : 0, rc : 0, large_pips_num : 0},//5
        {name : "15 Channel + 2 Clocks TR",     size : 4, size_v : 4,mode : "skip", tr : 0, br : 0, lc : 3, rc : 3, large_pips_num : 0},//6
        {name : "15 Channel + 2 Clocks BL",     size : 4, size_v : 4,mode : "skip", tr : 3, br : 3, lc : 0, rc : 0, large_pips_num : 0},//7
        {name : "15 Channel + 2 Clocks BR",     size : 4, size_v : 4,mode : "skip", tr : 3, br : 3, lc : 3, rc : 3, large_pips_num : 0},//8

        {name : "20 Channel + 2 Clocks",        size : 5, size_v : 5,mode : "skip", tr : 2, br : 2, lc : 0, rc : 3, large_pips_num : 0},//9
        

        {name : "25 Channel",                   size : 5, size_v : 5,mode : "insert", tr : 0, br : 4, lc : 0, rc : 4, large_pips_num : 0},//10,

        {name : "3+4L",                         size : 2, size_v : 2,mode : "skip", tr : 1, br : 1, lc : 0, rc : 0, large_pips_num : 0},//11
        

        {name : "30 Channel + 2x MADIAudio",    size : 6, size_v : 6,mode : "skip",   tr : 5, br : 5, lc : 0, rc : 5, large_pips_num : 0},//12
        {name : "30 Channel + 2 Clocks",        size : 6, size_v : 6,mode : "skip",   tr : 5, br : 5, lc : 0, rc : 5, large_pips_num : 0},//13

        {name : "2+4L + Clocks",                size : 2, size_v : 2,mode : "skip",   tr : 0, br : 0, lc : 0, rc : 1, large_pips_num : 0},//14,

        {name : "8+2",                          size : 4, size_v : 4,mode : "skip", tr : 2, br : 3, lc : 0, rc : 3, large_pips_num : 2},//15

        {name : "5+1BL",                        size : 3, size_v : 3,mode : "skip", tr : 1, br : 2, lc : 0, rc : 1, large_pips_num : 1},//16
        {name : "5+1BR",                        size : 3, size_v : 3,mode : "skip", tr : 1, br : 2, lc : 1, rc : 2, large_pips_num : 1},//17
        
        {name : "8 Channel + 2 Clocks",         size : 3, size_v : 3,mode : "skip", tr : 2, br : 2, lc : 1, rc : 1, large_pips_num : 0},//18
        {name : "8 Channel + 2 Clocks TR",      size : 3, size_v : 3,mode : "skip", tr : 0, br : 0, lc : 2, rc : 2, large_pips_num : 0},//19
       

        {name : "16 + 1LR + 4MADI",             size : 5, size_v : 4,mode : "skip", tr : 2, br : 3, lc : 3, rc : 4, large_pips_num : 1},//20
        {name : "2+5+5",                        size : 2, size_v : 1,mode : "skip", tr : 1, br : 1, lc : 0, rc : 1, large_pips_num : 0},//21

        {name : "1BIG+7",                       size : 4, size_v : 4,mode : "skip", tr : 0, br : 2, lc : 0, rc : 2, large_pips_num : 1},//22

        {name : "LEAGUE 10BOX TVT",             size : 5, size_v : 5,mode : "skip", tr : 0, br : 4, lc : 0, rc : 4, large_pips_num : 0}///23        
    ];   

    for(let i = 0; i < layouts_description.length;i++) 
    {
        let layout = {
                db_schema               : 'video',   
                db_table                : 'multiviewer_layouts', 
                db_table_records        :
                        [
                            {
                                name                : layouts_description[i].name + ' ' + parameters.pip_configuration.name,
                                style_bgnd_color    : parameters.layout_style_bgnd_color,
                                video_raster_id     : parameters.video_raster_id,
                                video_raster_width  : parameters.video_raster_width,
                                video_raster_height : parameters.video_raster_height                                
                            }                                    
                        ],
                        children    : <any>[],
                        x           : 0,
                        y           : 0
            }     
            
            let screen_width    = (parameters.video_raster_width  - ((parameters.edge_gap_x_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_x_size));
            let screen_height   = (parameters.video_raster_height - ((parameters.edge_gap_y_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_y_size));        
            let pip_width       = screen_width/layouts_description[i].size; 
            let pip_height      = screen_height/layouts_description[i].size;     
            let pip_id          = {pip_id : 0};                          

            //large pips
            if(layouts_description[i].large_pips_num == 1)
            {
                          
                
                let not_active_rows     = ((layouts_description[i].br-layouts_description[i].tr)+1);                
                let active_rows         = layouts_description[i].size - not_active_rows;
                let large_pip_height    = round_to_even(pip_height*not_active_rows);    
                let large_pip_width     = round_to_even((large_pip_height*16)/9);
                let large_pip_x_offset  = parameters.edge_gap_x_size + layouts_description[i].lc * (pip_width + parameters.interpip_gap_x_size);
                let large_pip_y_offset  = parameters.edge_gap_y_size + layouts_description[i].tr * (pip_height + parameters.interpip_gap_y_size);

                if((large_pip_width*layouts_description[i].large_pips_num) > screen_width)
                {
                    large_pip_width  = round_to_even(screen_width / (layouts_description[i].large_pips_num));
                    large_pip_height = round_to_even((large_pip_width*9)/16);
                    large_pip_y_offset = (large_pip_y_offset + round_to_even((screen_height - (large_pip_y_offset + large_pip_height))/2));
                    if(i == 20)
                    {
                        large_pip_width     = round_to_even(pip_width*2);
                        large_pip_height    = round_to_even(pip_height*2);                        
                    }
                }

                if(layouts_description[i].large_pips_num > 1)
                {
                    large_pip_x_offset = round_to_even((screen_width - large_pip_width*layouts_description[i].large_pips_num)/(layouts_description[i].large_pips_num));                
                }

                let large_pip_geometry =
                {
                    x       : large_pip_x_offset,
                    y       : large_pip_y_offset,
                    width   : large_pip_width,
                    height  : large_pip_height
                };    

                for(let j = 0; j < layouts_description[i].large_pips_num;j++)
                {
                    generate_pip(pip_id.pip_id++,large_pip_geometry,parameters,layout);  
                    large_pip_geometry.x += large_pip_width;
                    large_pip_geometry.x += large_pip_x_offset;
                }

            }
            //small pips
            {    
                pips_helper(pip_id,layouts_description[i],parameters,layout,pip_width,pip_height,0,0);
            }   
            //clocks
            if(((i >= 5) && (i <= 9)) || (i==13) || (i==14) || (i == 18) || (i == 19))
            {                                 
                              
                for(let j= 0; j < 2;j++)
                {                    
                    
           
                    let row                = layouts_description[i].tr;
                    let col                = layouts_description[i].lc;
                    let clock_width        = round_to_even(pip_width);
                    let clock_height       = round_to_even(pip_height/2);
                    let clock_top          = round_to_even(parameters.edge_gap_y_size  + row*(pip_height+parameters.interpip_gap_y_size));
                    let clock_left         = round_to_even(parameters.edge_gap_x_size  + col*(pip_width+parameters.interpip_gap_x_size));
    
                    if(((i >= 5) && (i <= 8)) || (i == 14) || (i == 18) || (i == 19))
                    {
                        clock_top = round_to_even(clock_top + (parameters.interpip_gap_y_size + clock_height)*j);
                    }
                    if(i == 9)
                    {
                        clock_width        = round_to_even(pip_width*2);
                        clock_height       = round_to_even(pip_height);
                        if(j == 1)
                        {
                            clock_left = round_to_even(clock_left + (parameters.interpip_gap_x_size + clock_width+pip_width)*j);
                        }
                    }
                    //"30 Channel + 2 Clocks"
                    if(i == 13)
                    {
                        clock_width        = round_to_even(pip_width*3);
                        clock_height       = round_to_even(pip_height);
                        if(j == 1)
                        {
                            clock_left    = round_to_even(parameters.edge_gap_x_size +   j*(clock_width + 2*parameters.interpip_gap_x_size));
                        }
                    }
                    //"2+4L + Clocks"
                    if(i == 14)
                    {
                        clock_left         = round_to_even(parameters.edge_gap_x_size  + 1*(pip_width+parameters.interpip_gap_x_size));
                    }
        
                    let digital_clock = {
                        db_schema         : 'video',   
                        db_table          : 'multiviewer_layout_digital_clocks', 
                        db_table_records  :
                        [
                            {                                                 
                                style_top                            : clock_top,
                                style_left                           : clock_left,
                                style_width                          : clock_width,
                                style_height                         : clock_height,//,
                                //--bgnd
                                //style_bgnd_color                     : ?, 
                                //style_opacity                        : ?,
                                //--fgnd
                                style_color                          : ((j==0)?'red':'white'),
                                //style_font_opacity                   : ?
                                
                            }                                    
                        ]       
                    };
                    layout.children.push(digital_clock);
                }                
            }
            //special cases
            {
                //"3+4L", //"2+4L + Clocks"
                if((i == 11) || (i == 14) || (i == 15) || (i == 21) || (i == 23))
                {   //override description
                    layouts_description[i].size   = 4;
                    layouts_description[i].size_v = 4;
                    layouts_description[i].mode   = "insert";
                    layouts_description[i].tr     = 2;
                    layouts_description[i].br     = 3;
                    layouts_description[i].lc     = 0;
                    layouts_description[i].rc     = 1;
                    let offset_x                  = 0;
                    let offset_y                  = 0;

                    if(i == 14)
                    {
                        layouts_description[i].tr     = 0;
                        layouts_description[i].br     = 1;
                    }

                    if(i == 15)
                    {
                        layouts_description[i].size   = 2;
                        layouts_description[i].size_v = 2;                        
                        layouts_description[i].tr     = 1;
                        layouts_description[i].br     = 1;
                        layouts_description[i].lc     = 0;
                        layouts_description[i].rc     = 1;
                    }


                                  
                    screen_width    = (parameters.video_raster_width  - ((parameters.edge_gap_x_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_x_size));
                    screen_height   = (parameters.video_raster_height - ((parameters.edge_gap_y_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_y_size));  
                    pip_width       = screen_width/layouts_description[i].size; 
                    pip_height      = screen_height/layouts_description[i].size; 

                    if(i == 21)
                    {
                        

                        layouts_description[i].size   = 5;
                        layouts_description[i].size_v = 2;                        
                        layouts_description[i].tr     = 0;
                        layouts_description[i].br     = 1;
                        layouts_description[i].lc     = 0;
                        layouts_description[i].rc     = 4;
                        screen_width    = (parameters.video_raster_width     - ((parameters.edge_gap_x_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_x_size));
                        screen_height   = (parameters.video_raster_height/2  - ((parameters.edge_gap_y_size*2) + 2*parameters.interpip_gap_x_size));
                        pip_width       = screen_width/layouts_description[i].size; 
                        pip_height      = screen_height/2; 
                        offset_y        = (parameters.video_raster_height/2);
                        
                    }

                    if(i == 23)
                    {
                        layouts_description[i].size   = 5;
                        layouts_description[i].size_v = 1;                        
                        layouts_description[i].tr     = 0;
                        layouts_description[i].br     = 0;
                        layouts_description[i].lc     = 0;
                        layouts_description[i].rc     = 4;
                        screen_width    = (parameters.video_raster_width     - ((parameters.edge_gap_x_size*2) + (layouts_description[i].size-1)*parameters.interpip_gap_x_size));
                        screen_height   = (parameters.video_raster_height/2  - ((parameters.edge_gap_y_size*2) + 2*parameters.interpip_gap_x_size));
                        pip_width       = screen_width/layouts_description[i].size; 
                        pip_height      = screen_height/2; 
                        offset_y        = ((parameters.video_raster_height/10)*2);
                    }

                    pips_helper(pip_id,layouts_description[i],parameters,layout,pip_width,pip_height,offset_x,offset_y);

                    if(i == 23)
                    {
                        offset_y        = ((parameters.video_raster_height/10)*7);
                        pips_helper(pip_id,layouts_description[i],parameters,layout,pip_width,pip_height,offset_x,offset_y);
                    }

                }else
                //"30 Channel + 2x MADIAudio"
                //"16 + 1LR + 4MADI"
                if((i == 12) || (i == 20))
                {
                   
                    let audio_source_top     = round_to_even(parameters.edge_gap_y_size +  5*(pip_height+parameters.interpip_gap_y_size));                    
                    let audio_source_height  = round_to_even(pip_height);
                    let audio_source_width   = round_to_even(pip_width*3);
                    let audio_sources_num    = 2;
                    let audio_channels_num   = 64; 

                    if(i == 20)
                    {          
                        audio_source_top     = round_to_even(parameters.edge_gap_y_size +  4*(pip_height+parameters.interpip_gap_y_size));                
                        audio_source_width   = round_to_even((pip_width*5)/4);
                        audio_sources_num    = 4;
                        audio_channels_num   = 64; 
                    }


                    for(let j = 0; j < audio_sources_num;j++)
                    {
                        
                        let audio_source_left    = round_to_even(parameters.edge_gap_x_size +   j*(audio_source_width + parameters.interpip_gap_x_size));

                        let audio_source = {
                            db_schema         : 'video',   
                            db_table          : 'multiviewer_layout_audio_sources', 
                            db_table_records  :
                            [
                               {      
                                   parent_video_source_on_parent_id  : j,
                                   style_top                         : audio_source_top,
                                   style_left                        : audio_source_left,
                                   style_width                       : audio_source_width,
                                   style_height                      : audio_source_height,
                                   style_z_index                     : 1,
                                   //--
                                   on_parent_id                      : 2*j,                                
                                   //on_parent_id_index                : 2*j,
                                   //--
                                   channels_offset                   : 0,
                                   channels_num                      : audio_channels_num /*,
                                   //--
                                   style_opacity                     : as_parameters.cells[i].style_opacity,
                                   ppm_green_colour_on               : as_parameters.cells[i].ppm_green_colour_on,
                                   ppm_green_colour_off              : as_parameters.cells[i].ppm_green_colour_off,      
                                   ppm_yellow_colour_on              : as_parameters.cells[i].ppm_yellow_colour_on,
                                   ppm_yellow_colour_off             : as_parameters.cells[i].ppm_yellow_colour_off, 
                                   ppm_red_colour_on                 : as_parameters.cells[i].ppm_red_colour_on,
                                   ppm_red_colour_off                : as_parameters.cells[i].ppm_red_colour_off,
                                   ppm_opacity_on                    : as_parameters.cells[i].ppm_opacity_on */                        
                               }                                    
                            ]                                        
                        };   
                        layout.children.push(audio_source);  
                    }
                } 
            }
            //console.log('layout ',layout.db_table_records[0].name);

        layouts.push(layout);
    }
}
export function get_default_md_cell()
{
    let md_cell = 
    {
        width                               : 1.0,
        //
        mode                                : 'label',                 
        label                               : 'UMD',
        //--bgnd
        style_bgnd_color                    : 'black', 
        style_opacity                       : 1.0,
        //--fgnd
        style_color                         : 'white',
        style_font_opacity                  : 1.0,
        style_font_weight                   : '600',
        style_font_family                   : 'Open Sans',
        style_font_style                    : 'normal',
        style_text_stroke_width             : 0,
        style_text_stroke_color             : 'white',
        //--border                
        style_border_top_left_radius        : 0,
        style_border_top_right_radius       : 0,
        style_border_bottom_left_radius     : 0,
        style_border_bottom_right_radius    : 0,            
        border_alignment                    : 'inside',                                  
        style_border_width                  : 2*0, 
        style_border_color                  : 'gray',
        //tally
        tally_bgnd_rules_mask               : 0,
        tally_fgnd_rules_mask               : 0,
        tally_border_rules_mask             : 0
    };
    return md_cell;
}

export function get_default_md(cells_num : any)
{
    let md =
    {        
        alignment            : 'outside',
        height               : 0.095,
        width                : 1.0,
        cells                : []
    };
    for(let i = 0; i < cells_num;i++)
    {
        let cell = get_default_md_cell();
        md.cells.push(cell);
    }
    return md;
}

export function get_default_tally_lamp_cell()
{
    let tally_lamp_cell = 
    {               
        style_border_width                   : 2*0, 
        style_border_color                   : 'gray',                            
        //--bgnd
        style_bgnd_color                     : 'black',                                                                                                                                                                          
        style_opacity                        : 1.0,
        //
        style_border_top_left_radius         : 50*0,
        style_border_top_right_radius        : 50*0,
        style_border_bottom_left_radius      : 50*0,
        style_border_bottom_right_radius     : 50*0,

        tally_bgnd_rules_mask                : 0,
        tally_border_rules_mask              : 0 
    };
    return tally_lamp_cell;
}

export function get_default_tally_lamps(cells_num : any)
{
    let tally_lamps =
    {        
        alignment            : 'outside',        
        cells                : []
    };
    for(let i = 0; i < cells_num;i++)
    {
        let cell = get_default_tally_lamp_cell();
        tally_lamps.cells.push(cell);
    }
    return tally_lamps;
}

export function get_default_ppms(cells_num : any)
{
    let ppms =
    {        
        alignment            : 'outside',        
        width                : 0.05,
        width_max            : null,
        channel_min_width    : null,
        cells                : []
    };
    for(let i = 0; i < cells_num;i++)
    {
        let cell = {
            channels_offset             : 0,
            channels_num                : 2,
            style_opacity               : 1.0,
            ppm_green_colour_on         : '#00ff00',
            ppm_green_colour_off        : '#005400',      
            ppm_yellow_colour_on        : '#ffff00',
            ppm_yellow_colour_off       : '#545400', 
            ppm_red_colour_on           : '#ff0000',
            ppm_red_colour_off          : '#540000',
            ppm_opacity_on              : 1.0            
        };
        ppms.cells.push(cell);
    }
    return ppms;
}

export function get_defaul_video_source()
{
    let video_source = {
        //
        border_alignment                                : 'inside',                                  
        style_border_width                              : 2*0, 
        style_border_color                              : 'gray',
        tally_border_rules_mask                         : 15,
        //
        use_widgets_enable                              : false,
        //
        alarms_enable                                   : false,
        alarms_on_video_source_not_assigned_show_logo   : true
    };
    return video_source;
}

export function get_default_digital_clock() 
{
    //currently limited implementation
    let digital_clock = {
        //
        alignment : 'under_omd',
        //--bgnd
        style_bgnd_color                    : 'black', 
        style_opacity                       : 0.8,
        //--fgnd
        style_color                         : 'white',
        style_font_opacity                  : 1.0
    };
    return digital_clock;
}

export function get_default_pip_configurations(configurations_num : any)
{
    let pip_configurations :  any[] = [];          
    for(let i = 0; i < configurations_num;i++)
    {
        let pip_configuration = {
            enable                   : false,
            name                     : '',
            keep_aspect_ratio        : true,
            full_size_1_way          : false,
            //pip elements
            video_source             : get_defaul_video_source(),
            omd                      : null,
            umd                      : null,                
            tally_lamps_left         : null,
            tally_lamps_right        : null,
            ppms_left                : null,
            ppms_right               : null,
            digital_clock            : null,
            //enable layouts
            standard_layouts_enable  : false,                                        
            layouts_enable           : false,
            remote_layouts_enable    : false,
            director_layouts_enable  : false,
            vt_coord_layouts_enable  : false,
            big_layouts_enable       : false,
            riot_layouts_enable      : false
        };
        pip_configurations.push(pip_configuration);
    }
    return pip_configurations;    
}


export function get_default_rasters_configurations(configurations_num : any)
{
    let raster_configurations : any[] = [];   
    for(let i = 0; i < configurations_num;i++)
    {
        let raster_configuration = {
            enable                      : false,
            layout_style_bgnd_color     : 'black',
            video_raster_id             : '1920x1080',
            video_raster_width          : 1920,
            video_raster_height         : 1080,
            //for pips
            edge_gap_x_size             : 2,
            edge_gap_y_size             : 2,
            interpip_gap_x_size         : 2,
            interpip_gap_y_size         : 2,
            //widgets inside pip
            pip_edge_gap_x_size         : 0,
            pip_edge_gap_y_size         : 0,
            pip_interwidget_gap_x_size  : 2,
            pip_interwidget_gap_y_size  : 2,
            pip_configuration           : null
        };
        raster_configurations.push(raster_configuration); 
    }
    return raster_configurations;
}



export const DEFAULT_LAYOUTS_ID               : number = 0;
//
export const OUTSIDE_LAYOUTS_UMD_ID           : number = 1;
export const OUTSIDE_LAYOUTS_UMD_PPM_ID       : number = 2;
export const OUTSIDE_LAYOUTS_UMD_TALLY_ID     : number = 3;
export const OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID : number = 4;
//
export const INSIDE_LAYOUTS_UMD_ID            : number = 5;
export const INSIDE_LAYOUTS_UMD_PPM_ID        : number = 6;
export const INSIDE_LAYOUTS_UMD_TALLY_ID      : number = 7;
export const INSIDE_LAYOUTS_UMD_PPM_TALLY_ID  : number = 8;
//
export const USER_0_LAYOUTS_ID                : number = 9;
export const USER_1_LAYOUTS_ID                : number = 10;
export const USER_2_LAYOUTS_ID                : number = 11;
export const USER_3_LAYOUTS_ID                : number = 12;
export const USER_4_LAYOUTS_ID                : number = 13;
export const LAYOUTS_CONFIGS_NUM              : number = 14;
//
export const RASTER_1280x720_ID               : number = 0;
export const RASTER_1920x1080_ID              : number = 1;
export const RASTER_3840x2160_ID              : number = 2;
export const RASTERS_NUM                      : number = 3;



export function generate_layouts_parameters()
{

    //some common constants
    let RED_TALLY_CLR_OFF       = '#200000';
    let GREEN_TALLY_CLR_OFF     = '#002000';
    let YELLOW_TALLY_CLR_OFF    = '#202000';
    let BLUE_TALLY_CLR_OFF      = '#000020';

    let parameters =
    {
        pip_configurations      : null,       
        raster_configurations   : null
    };
    
    //parameters
    parameters.pip_configurations = get_default_pip_configurations(LAYOUTS_CONFIGS_NUM);
    {
        //---------------------------------------------------------------------------------------------------------
        //DEFAULT_LAYOUTS_ID -  no pips widgets  
        //---------------------------------------------------------------------------------------------------------
        {
            parameters.pip_configurations[DEFAULT_LAYOUTS_ID].keep_aspect_ratio                             = false;
            parameters.pip_configurations[DEFAULT_LAYOUTS_ID].full_size_1_way                               = true;            
        }
        //---------------------------------------------------------------------------------------------------------
        //OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID  - pip widgets outside video source 
        //---------------------------------------------------------------------------------------------------------
        {            
            parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].name                                                              = 'outside (umd + ppm + tally)';//name postfix could be empty
            parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].keep_aspect_ratio                                                 = true;                        
            {
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].umd                                                           = get_default_md(1);
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].umd.alignment                                                 = 'outside';
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].umd.width                                                     = 1.0;                            
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].umd.cells[0].mode                                             = 'parent_video_source_tally_label',//'label';            
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].umd.cells[0].style_bgnd_color                                 = 'black';
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].umd.cells[0].style_color                                      = 'white'; //font 
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].umd.cells[0].style_border_width                               = 2*0;
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].umd.cells[0].style_border_color                               ='gray';              
            }            
            {
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_left                                              = get_default_tally_lamps(1);
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_left.cells[0].style_bgnd_color                    = RED_TALLY_CLR_OFF;
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_left.cells[0].style_border_top_left_radius        = 50*0;
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_left.cells[0].style_border_top_right_radius       = 50*0;
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_left.cells[0].style_border_bottom_left_radius     = 50*0;
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_left.cells[0].style_border_bottom_right_radius    = 50*0;
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_left.cells[0].tally_bgnd_rules_mask               = 1;                               
            }            
            {
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_right                                             = get_default_tally_lamps(1);
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_right.cells[0].style_bgnd_color                   = GREEN_TALLY_CLR_OFF;
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_right.cells[0].style_border_top_left_radius       = 50*0;
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_right.cells[0].style_border_top_right_radius      = 50*0;
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_right.cells[0].style_border_bottom_left_radius    = 50*0;
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_right.cells[0].style_border_bottom_right_radius   = 50*0;
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_right.cells[0].tally_bgnd_rules_mask              = 2; 

            }           
            {
                
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_left                                                     = get_default_ppms(1);
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_left.alignment                                           = 'outside';
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_left.cells[0].channels_offset                            = 0;
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_left.cells[0].channels_num                               = 2;
            }            
            {                
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_right                                                    = get_default_ppms(1);
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_right.alignment                                           = 'outside';                                                  
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_right.cells[0].channels_offset                           = 2;
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_right.cells[0].channels_num                              = 2;
            }
            //OUTSIDE_LAYOUTS_UMD_TALLY_ID
            {
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_TALLY_ID]                                                                   = clone(parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID]);
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_TALLY_ID].name                                                              = 'outside (umd + tally)';
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_TALLY_ID].ppms_left                                                         = null; 
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_TALLY_ID].ppms_right                                                        = null;
            }
            //OUTSIDE_LAYOUTS_UMD_PPM_ID
            {
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_ID]                                                                     = clone(parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID]);
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_ID].name                                                                = 'outside (umd + ppm)';
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_ID].tally_lamps_left                                                    = null; 
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_ID].tally_lamps_right                                                   = null;
            }
            //OUTSIDE_LAYOUTS_UMD_ID
            {
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_ID]                                                                         = clone(parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID]);
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_ID].name                                                                    = 'outside (umd)';
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_ID].ppms_left                                                               = null; 
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_ID].ppms_right                                                              = null;
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_ID].tally_lamps_left                                                        = null; 
                parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_ID].tally_lamps_right                                                       = null;
            }
        }
        //---------------------------------------------------------------------------------------------------------
        //INSIDE_LAYOUTS_UMD_PPM_TALLY_ID - pip widgets inside source 
        //---------------------------------------------------------------------------------------------------------
        {            
            
            parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID]                                                                    = clone(parameters.pip_configurations[OUTSIDE_LAYOUTS_UMD_PPM_TALLY_ID]);
            //parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].umd.cells[0].style_bgnd_color                                    = 'gray';
            parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].name                                                               = 'inside';
            parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].umd.alignment                                                      = 'inside';
            //parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].umd.width                                                        = 0.6;//0.5; 
            parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].umd.cells[0].style_opacity                                         = 0.8;
            parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].umd.cells[0].style_font_opacity                                    = 0.9,
            parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_left.cells[0].style_opacity                            = 0.8;
            parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].tally_lamps_right.cells[0].style_opacity                           = 0.8;          
            parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_left.alignment                                                = 'inside';
            parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_left.cells[0].style_opacity                                   = 0.0;
            parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_left.cells[0].ppm_opacity_on                                  = 0.8;
            parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_right.alignment                                               = 'inside';                           
            parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_right.cells[0].style_opacity                                  = 0.0;
            parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID].ppms_right.cells[0].ppm_opacity_on                                 = 0.8;

            //INSIDE_LAYOUTS_UMD_TALLY_ID
            {
                parameters.pip_configurations[INSIDE_LAYOUTS_UMD_TALLY_ID]                                                                    = clone(parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID]);
                parameters.pip_configurations[INSIDE_LAYOUTS_UMD_TALLY_ID].name                                                               = 'inside (umd + tally)';
                parameters.pip_configurations[INSIDE_LAYOUTS_UMD_TALLY_ID].ppms_left                                                          = null; 
                parameters.pip_configurations[INSIDE_LAYOUTS_UMD_TALLY_ID].ppms_right                                                         = null;
            }
            //INSIDE_LAYOUTS_UMD_PPM_ID
            {
                parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_ID]                                                                      = clone(parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID]);
                parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_ID].name                                                                 = 'inside (umd + ppm)';
                parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_ID].tally_lamps_left                                                     = null; 
                parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_ID].tally_lamps_right                                                    = null;
            }
            //INSIDE_LAYOUTS_UMD_ID
            {
                parameters.pip_configurations[INSIDE_LAYOUTS_UMD_ID]                                                                          = clone(parameters.pip_configurations[INSIDE_LAYOUTS_UMD_PPM_TALLY_ID]);
                parameters.pip_configurations[INSIDE_LAYOUTS_UMD_ID].name                                                                     = 'inside (umd)';
                parameters.pip_configurations[INSIDE_LAYOUTS_UMD_ID].ppms_left                                                                = null; 
                parameters.pip_configurations[INSIDE_LAYOUTS_UMD_ID].ppms_right                                                               = null;
                parameters.pip_configurations[INSIDE_LAYOUTS_UMD_ID].tally_lamps_left                                                         = null; 
                parameters.pip_configurations[INSIDE_LAYOUTS_UMD_ID].tally_lamps_right                                                        = null;
            }          
        }
        //---------------------------------------------------------------------------------------------------------
        //USER0
        //---------------------------------------------------------------------------------------------------------
        {
            parameters.pip_configurations[USER_0_LAYOUTS_ID].name                                           = 'SKY 2';//2 umds
            parameters.pip_configurations[USER_0_LAYOUTS_ID].full_size_1_way                                = true;           
            parameters.pip_configurations[USER_0_LAYOUTS_ID].video_source.use_widgets_enable                = true;                                   
            parameters.pip_configurations[USER_0_LAYOUTS_ID].omd                                            = get_default_md(2);
            {
                parameters.pip_configurations[USER_0_LAYOUTS_ID].omd.alignment                              = 'inside';
                parameters.pip_configurations[USER_0_LAYOUTS_ID].omd.width                                  = 0.3;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].omd.cells[0].mode                          = 'parent_video_source_standard_interface',//'label';
                parameters.pip_configurations[USER_0_LAYOUTS_ID].omd.cells[0].width                         = 0.5;                
                parameters.pip_configurations[USER_0_LAYOUTS_ID].omd.cells[0].label                         = '12G';  
                parameters.pip_configurations[USER_0_LAYOUTS_ID].omd.cells[0].style_bgnd_color              = 'gray';
                parameters.pip_configurations[USER_0_LAYOUTS_ID].omd.cells[0].style_opacity                 = 0.8;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].omd.cells[1].mode                          = 'parent_video_source_standard_tcs',//'label';
                parameters.pip_configurations[USER_0_LAYOUTS_ID].omd.cells[1].width                         = 0.5;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].omd.cells[1].label                         = 'HLG'; 
                parameters.pip_configurations[USER_0_LAYOUTS_ID].omd.cells[1].style_bgnd_color              = 'gray';
                parameters.pip_configurations[USER_0_LAYOUTS_ID].omd.cells[1].style_opacity                 = 0.8;
            }
            parameters.pip_configurations[USER_0_LAYOUTS_ID].umd                                            = get_default_md(2);
            {        
                parameters.pip_configurations[USER_0_LAYOUTS_ID].umd.alignment                              = 'outside';
                parameters.pip_configurations[USER_0_LAYOUTS_ID].umd.width                                  = 1.0;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].umd.cells[0].mode                          = 'parent_video_source_user_label_0',//'label';
                parameters.pip_configurations[USER_0_LAYOUTS_ID].umd.cells[0].width                         = 0.33;                
                parameters.pip_configurations[USER_0_LAYOUTS_ID].umd.cells[0].label                         = 'UMD 2';  
                parameters.pip_configurations[USER_0_LAYOUTS_ID].umd.cells[1].mode                          = 'parent_video_source_tally_label',//'parent_video_source_user_label_1',//'label';
                parameters.pip_configurations[USER_0_LAYOUTS_ID].umd.cells[1].width                         = 0.67;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].umd.cells[1].label                         = 'UMD 1'; 
              
            }                
            parameters.pip_configurations[USER_0_LAYOUTS_ID].tally_lamps_left                               = get_default_tally_lamps(2);
            {
                parameters.pip_configurations[USER_0_LAYOUTS_ID].tally_lamps_left.cells[0].style_bgnd_color         = RED_TALLY_CLR_OFF;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].tally_lamps_left.cells[0].tally_bgnd_rules_mask    = 1;                
                parameters.pip_configurations[USER_0_LAYOUTS_ID].tally_lamps_left.cells[1].style_bgnd_color         = YELLOW_TALLY_CLR_OFF;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].tally_lamps_left.cells[1].tally_bgnd_rules_mask    = 4;

            }
            parameters.pip_configurations[USER_0_LAYOUTS_ID].tally_lamps_right                                      = get_default_tally_lamps(2);
            {
                parameters.pip_configurations[USER_0_LAYOUTS_ID].tally_lamps_right.cells[0].style_bgnd_color         = GREEN_TALLY_CLR_OFF;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].tally_lamps_right.cells[0].tally_bgnd_rules_mask    = 2;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].tally_lamps_right.cells[1].style_bgnd_color         = BLUE_TALLY_CLR_OFF;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].tally_lamps_right.cells[1].tally_bgnd_rules_mask    = 8;
            }
            
            parameters.pip_configurations[USER_0_LAYOUTS_ID].ppms_left                                      = get_default_ppms(2);
            {
                parameters.pip_configurations[USER_0_LAYOUTS_ID].ppms_left.cells[0].channels_offset         = 0;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].ppms_left.cells[0].channels_num            = 4;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].ppms_left.cells[1].channels_offset         = 0;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].ppms_left.cells[1].channels_num            = 4;
            }
            parameters.pip_configurations[USER_0_LAYOUTS_ID].ppms_right                                     = get_default_ppms(2);
            {
                parameters.pip_configurations[USER_0_LAYOUTS_ID].ppms_right.cells[0].channels_offset        = 0;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].ppms_right.cells[0].channels_num           = 4;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].ppms_right.cells[1].channels_offset        = 0;
                parameters.pip_configurations[USER_0_LAYOUTS_ID].ppms_right.cells[1].channels_num           = 4;
            }
            parameters.pip_configurations[USER_0_LAYOUTS_ID].digital_clock                                  = get_default_digital_clock();        
        }
        //---------------------------------------------------------------------------------------------------------
        //USER1
        //---------------------------------------------------------------------------------------------------------
        {
            parameters.pip_configurations[USER_1_LAYOUTS_ID]                          = clone(parameters.pip_configurations[USER_0_LAYOUTS_ID]);
            parameters.pip_configurations[USER_1_LAYOUTS_ID].name                     = 'SKY 1';
            parameters.pip_configurations[USER_1_LAYOUTS_ID].umd                      = get_default_md(1);
            {        
                parameters.pip_configurations[USER_1_LAYOUTS_ID].umd.alignment        = 'outside';
                parameters.pip_configurations[USER_1_LAYOUTS_ID].umd.width            = 1.0;
                parameters.pip_configurations[USER_1_LAYOUTS_ID].umd.cells[0].mode    = 'parent_video_source_tally_label',//'label';
                parameters.pip_configurations[USER_1_LAYOUTS_ID].umd.cells[0].width   = 1.0;                
                parameters.pip_configurations[USER_1_LAYOUTS_ID].umd.cells[0].label   = 'UMD 1';                  
            }
        }
    }
    //rasters
    parameters.raster_configurations = get_default_rasters_configurations(RASTERS_NUM);
    {
        //RASTER_1280x720_ID
        {                       
            parameters.raster_configurations[RASTER_1280x720_ID].video_raster_id            = '1280x720';            
            parameters.raster_configurations[RASTER_1280x720_ID].video_raster_width         = 1280;
            parameters.raster_configurations[RASTER_1280x720_ID].video_raster_height        = 720;
        }
        //RASTER_1920x1080_ID
        {                                
            parameters.raster_configurations[RASTER_1920x1080_ID].video_raster_id            = '1920x1080';            
            parameters.raster_configurations[RASTER_1920x1080_ID].video_raster_width         = 1920;
            parameters.raster_configurations[RASTER_1920x1080_ID].video_raster_height        = 1080;
        }
        //RASTER_3840x2160_ID
        {
            parameters.raster_configurations[RASTER_3840x2160_ID].video_raster_id            = '3840x2160';            
            parameters.raster_configurations[RASTER_3840x2160_ID].video_raster_width         = 3840;
            parameters.raster_configurations[RASTER_3840x2160_ID].video_raster_height        = 2160;
            //for pips
            parameters.raster_configurations[RASTER_3840x2160_ID].edge_gap_x_size            = 4;
            parameters.raster_configurations[RASTER_3840x2160_ID].edge_gap_y_size            = 4;
            parameters.raster_configurations[RASTER_3840x2160_ID].interpip_gap_x_size        = 4;
            parameters.raster_configurations[RASTER_3840x2160_ID].interpip_gap_y_size        = 4;
            //widgets inside pip
            parameters.raster_configurations[RASTER_3840x2160_ID].pip_edge_gap_x_size        = 4;
            parameters.raster_configurations[RASTER_3840x2160_ID].pip_edge_gap_y_size        = 4;
            parameters.raster_configurations[RASTER_3840x2160_ID].pip_interwidget_gap_x_size = 4;
            parameters.raster_configurations[RASTER_3840x2160_ID].pip_interwidget_gap_y_size = 4;
        }
    }

    return parameters;
}

export function generate_all_layouts(parameters : any)
{
    //console.log(parameters);
    
    const layouts :  any[] = []; 
    
    for(let raster_id = 0; raster_id < parameters.raster_configurations.length;raster_id++)
    {
        if(parameters.raster_configurations[raster_id].enable)
        {
            for(let pip_configuration_id = 0; pip_configuration_id < parameters.pip_configurations.length;pip_configuration_id++)
            {                
                if(parameters.pip_configurations[pip_configuration_id].enable)
                {
                    let pip_configuration = parameters.pip_configurations[pip_configuration_id];
                    //parameters.raster_configurations[raster_id].pip_configuration = pip_configuration;
                    
                    parameters.raster_configurations[raster_id].pip_configuration       = clone(pip_configuration);  
                    parameters.raster_configurations[raster_id].pip_configuration.name  = parameters.raster_configurations[raster_id].pip_configuration.name + ' ' + parameters.raster_configurations[raster_id].video_raster_id;

                    if(pip_configuration.standard_layouts_enable)
                    {
                        generate_standard_layouts(parameters.raster_configurations[raster_id],layouts);                                        
                    }
                    if(pip_configuration.layouts_enable)
                    {
                        generate_layouts(parameters.raster_configurations[raster_id],layouts);
                    }
                    if(pip_configuration.remote_layouts_enable)
                    {
                        generate_remote_layouts(parameters.raster_configurations[raster_id],layouts);                        
                    }
                    if(pip_configuration.director_layouts_enable)
                    {
                        generate_director_layouts(parameters.raster_configurations[raster_id],layouts);
                        generate_director_layouts2(parameters.raster_configurations[raster_id],layouts);
                    }
                    if(pip_configuration.vt_coord_layouts_enable)
                    {
                        generate_vt_coord_layouts(parameters.raster_configurations[raster_id],layouts);                    
                    }
                    if(pip_configuration.big_layouts_enable)
                    {
                        generate_big_layouts(parameters.raster_configurations[raster_id],layouts);
                    }
                    if(pip_configuration.riot_layouts_enable)
                    {
                        generate_riot_layouts(parameters.raster_configurations[raster_id],layouts);
                    }
                }
            }
        }
    }
    
    return layouts;
}
