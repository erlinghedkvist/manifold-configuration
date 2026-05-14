import {username,password}                           from './login';
import {login,login_cluster,lock_current_cluster,reset,create,read,t_callback}  from './utils';

let config                              : any;
//--------------------------------------------------------------------
function unlock_current_cluster_result(result : any)
{
    console.log("-----UNLOCK cluster-----");

}
//--------------------------------------------------------------------
let state_stack : any[] = [];
function create_child_result(result : any)
{    
    let state       = state_stack[state_stack.length-1];
    let child       = state.children[state.child_id];
    
    /*
    console.log("-------------------------------------------------------------------------");
    console.log(state);
    console.log("*");
    console.log(child);    
    console.log("*");
    console.log(result);
    console.log("-------------------------------------------------------------------------");
    */

    //console.log("stack before");
    //console.log(state_stack);

    if(child.children != undefined)
    {            
        let new_state = {        
            child_id            : 0,
            children            : child.children,
            parent_id           : result.result_value[0].id
        };         
        /*console.log("-----");
        console.log(result);
        console.log(new_state);*/

        state_stack.push(new_state);
        create_child();
    }else
    if(state.child_id < (state.children.length-1))
    {      
        state_stack[state_stack.length-1].child_id++;
        create_child();  
    }else
    {        
        let old_state = state_stack.pop();                 
        start : while(state_stack.length > 0)
        {
            let next_state = state_stack[state_stack.length-1];
            
            if(next_state.child_id < (next_state.children.length-1))
            {
                state_stack[state_stack.length-1].child_id++;
                create_child(); 
                return;
            } else {
                old_state = state_stack.pop(); 
                continue start;
            }
        }       
    }
    //console.log("i am here");
    //console.log(child.children.length);
    if((state_stack.length <= 0) /*|| (child.children.length <= 0)*/)
    {        
         lock_current_cluster(false,unlock_current_cluster_result);
    }
}

function create_child()
{   
    let state       = state_stack[state_stack.length-1]; 
    let nest_level  = state_stack.length-1;

    if(state.child_id < state.children.length)
    {
        let current_child    = state.children[state.child_id];

        let db_schema        = current_child.db_schema;
        let db_table         = current_child.db_table;
        let db_table_records = current_child.db_table_records;
        
        if (nest_level == 0)
        { 
            console.log(`${"record ".padEnd(nest_level*4)}` + state.child_id + " out of "+state.children.length+" : "+`${db_schema}` + `.${db_table}`);
        }
        
        let id = undefined;
       
        if(nest_level > 0)
        {
            for(let i = 0; i < db_table_records.length;i++)
            {
                db_table_records[i].parent_id = state.parent_id;
            }
        }        

        //console.log(db_table_records);

        let db_table_data    = JSON.stringify(db_table_records);
        create(db_schema,db_table,db_table_data,create_child_result);
    }          
}
//--------------------------------------------------------------------
function lock_current_cluster_result(result : any)
{
    let state = {        
        child_id            : 0,
        children            : config.manifold_cluster_configuration.children,
        parent_id           : undefined
    };  
    state_stack.push(state);
    create_child();
}

function login_cluster_result(result : any)
{        
    console.log("-----LOCK cluster-----");
    lock_current_cluster(true,lock_current_cluster_result);
}

function login_result(result : any)
{
    
    console.log("--------------------------------------------------------------------------------------");
    //console.log(result);
    
    login_cluster(config.manifold_cluster_configuration.cluster.name,
                  config.manifold_cluster_configuration.cluster_configuration.name,
                  config.manifold_cluster_configuration.cluster_configuration.reset,
                  config.manifold_cluster_configuration.cluster_configuration.activate,
                  login_cluster_result                
        );     
}    
//--------------------------------------------------------------------
import(process.argv[2]).then((manifold_cluster_configuration) => 
{           
    config   = manifold_cluster_configuration;      
    login(username,password,login_result);      
});
