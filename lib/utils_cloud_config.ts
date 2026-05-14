import {username,password}                   from './login';
import {login,reset,create,read,t_callback}  from './utils';

let config   : any;
let phase_id : number; 

function configurate(result : any)
{    
    //console.log(result);

    if (phase_id < config.manifold_cloud_configuration.length)
    {        
        let current_phase_id = phase_id;
        phase_id++;

        console.log(current_phase_id + ":" + " create "  +  config.manifold_cloud_configuration[current_phase_id].db_schema + "->" + config.manifold_cloud_configuration[current_phase_id].db_table);
        
        create(config.manifold_cloud_configuration[current_phase_id].db_schema,
               config.manifold_cloud_configuration[current_phase_id].db_table,
               JSON.stringify(config.manifold_cloud_configuration[current_phase_id].db_table_data),
               configurate);
    }
}

function start()
{
    phase_id = 0;
    reset(configurate); 
}

import(process.argv[2]).then((manifold_cloud_configuration) => 
{        
    if (manifold_cloud_configuration !== undefined)
    {
        config   = manifold_cloud_configuration;   
        login(username,password,start);       
    }
});
