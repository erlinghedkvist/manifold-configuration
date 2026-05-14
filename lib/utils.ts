
import { request } from 'http';


let request_port      = 3001;
export let login_jwt_token   ='';
export type t_callback = (result : any) => void

//--------------------------------------------------------------------------------------------------------------------------------
// global reset
//--------------------------------------------------------------------------------------------------------------------------------
export  function reset(callback ? : t_callback) {    
  
  const promise =  new Promise(function (resolve, reject) {
  
  
    var hdr = {
        'Content-Type'    : 'application/json',
        'Content-Profile' : 'global_schema',
        'Prefer': 'return=representation',
        'Authorization': `Bearer ${login_jwt_token}`
    };
    
    var body = '';
  
    const req = request(
      {       
        port : request_port,
        path: 'rpc/global_reset',    
        method: 'POST',
        headers: hdr         
      },
      response => {        
        
        response.on('data', function(chunk) {      
          body += chunk;
          });   
        response.on('end', function() {         
            //console.log("reset result :")             
            //console.log(body);      
            let result      = JSON.parse(body);
            if (typeof callback !== 'undefined') {               
                callback(result);
              }            
          });     
      }
    ); 
    const data = JSON.stringify(
      { "a": 1 }      
    );
    req.write(data);
    req.end();   
    });  
    return promise; 
    
}
//--------------------------------------------------------------------------------------------------------------------------------
// login
//--------------------------------------------------------------------------------------------------------------------------------
export  function login(login_name : string,login_password : string, callback ? : t_callback) {    

  const promise =  new Promise(function (resolve, reject) {


    const data = JSON.stringify({
        username              : login_name,
        password              : login_password
        //cluster_name          : 'bla',
        //cluster_configuration : 'blabla'
    });
    
    var hdr = {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        'Content-Length': data.length
    };
    
    var body = '';

    const req = request(
      {       
        port : request_port,
        path: 'rpc/login',    
        method: 'POST',
        headers: hdr         
      },
      response => {        
        
        response.on('data', function(chunk) {      
          body += chunk;
          });   
        response.on('end', function() {            
            let result      = JSON.parse(body);
            login_jwt_token = result.token;
            //console.log(login_jwt_token);                        
            //console.log("a");
            if (typeof callback !== 'undefined') {              
              callback(result);
            }
          });     
      }
    );     
    req.write(data);  
    req.end();   
    });  
    return promise; 
}
//--------------------------------------------------------------------------------------------------------------------------------
// login cluster
//--------------------------------------------------------------------------------------------------------------------------------
export async function login_cluster(login_cluster_name                   : string,
                               login_cluster_configuration_name     : string, 
                               login_cluster_configuration_reset    : boolean,
                               login_cluster_configuration_activate : boolean,
                               callback  : t_callback) 
{    

  const promise =  new Promise(function (resolve, reject) {

  const data = JSON.stringify({
    cluster_name                      : login_cluster_name,
    cluster_configuration_name        : login_cluster_configuration_name,
    cluster_configuration_reset       : login_cluster_configuration_reset,
    cluster_configuration_activate    : login_cluster_configuration_activate
  });

  var hdr = {
    'Content-Type'    : 'application/json',
    'Content-Profile' : 'cluster',  
    'Prefer'          : 'return=representation',
    'Authorization'   : `Bearer ${login_jwt_token}`,
    'Content-Length'  : data.length
  };

  var body = '';

  const req = request(
  {       
    port : request_port,
    path: 'rpc/login_cluster',    
    method: 'POST',
    headers: hdr         
  },
  response => {        
    
    response.on('data', function(chunk) {      
      body += chunk;
      });   
    response.on('end', function() {            
        let result      = JSON.parse(body);        
        //console.log(login_jwt_token);                        
        //console.log("a");
        if (typeof callback !== 'undefined') {              
          callback(result);
        }
      });     
  }
); 
req.write(data);  
req.end();   
});  
return promise;    
}
//--------------------------------------------------------------------------------------------------------------------------------
//lock cluster
//--------------------------------------------------------------------------------------------------------------------------------
export async function lock_current_cluster(lock_value    : boolean,callback  : t_callback) 
{    

    const promise =  new Promise(function (resolve, reject) {

    const data = JSON.stringify({
    new_lock                      : lock_value
  });

  var hdr = {
  'Content-Type'    : 'application/json',
  'Content-Profile' : 'cluster',  
  'Prefer'          : 'return=representation',
  'Authorization'   : `Bearer ${login_jwt_token}`,
  'Content-Length'  : data.length
  };

  var body = '';

  const req = request(
  {       
    port : request_port,
    path: 'rpc/lock_current_cluster',    
    method: 'POST',
    headers: hdr         
    },
  response => {        
  response.on('data', function(chunk) {      
  body += chunk;
  });   

  response.on('end', function() {            
  let result      = JSON.parse(body);          
  if (typeof callback !== 'undefined') {              
    callback(result);
  }
  });     
}
); 
req.write(data);  
req.end();   
});  
return promise;    
}
//--------------------------------------------------------------------------------------------------------------------------------
//create
//--------------------------------------------------------------------------------------------------------------------------------
export async function create(db_schema : string, db_table : string, db_table_data : string,callback ? : t_callback,payload ? : any) {    
    
  
  const promise =  new Promise(function (resolve, reject) {
  
  
  var hdr = {
      'Content-Type'    : 'application/json',
      'Content-Profile' : db_schema,
      'Prefer'          : 'return=representation',
      'Authorization'   : `Bearer ${login_jwt_token}`
  };
  
  var body = '';

  const req = request(
    {       
      port : request_port,
      path: "/"+db_table,    
      method: 'POST',
      headers: hdr         
    },
    response => {        
      
      response.on('data', function(chunk) {      
        body += chunk;
        });   
      response.on('end', function() {         
          //console.log("create result :")             
          //console.log(body);      
          let result      = JSON.parse(body);
          if (typeof callback !== 'undefined') { 
            callback({ "result_value" : result, "payload_value" : payload});                 
          }
        });     
    }
  ); 
  req.write(db_table_data);
  req.end();   

  });  
  return promise;    
}
//--------------------------------------------------------------------------------------------------------------------------------
//read
//--------------------------------------------------------------------------------------------------------------------------------
export async function read(db_schema : string, db_request : string, callback ? : t_callback,payload ? : any) {    
    
  const promise =  new Promise(function (resolve, reject) {
    
  var hdr = {
      'Content-Type'    : 'application/json',
      'Accept-Profile' : db_schema,
      'Prefer': 'return=representation',
      'Authorization': `Bearer ${login_jwt_token}`
  };
  
  var body = '';

  //console.log('read');
  //console.log(login_jwt_token);

  const req = request(
    {       
      port : request_port,
      path: "/"+db_request,    
      method: 'GET',
      headers: hdr         
    },
    response => {        
      
      response.on('data', function(chunk) {      
        body += chunk;
        });   
      response.on('end', function() {                   
          //console.log(body);      
          let result      = JSON.parse(body);
          if (typeof callback !== 'undefined') { 
            callback({ "result_value" : result, "payload_value" : payload});                
          }
        });     
    }
  ); 
  req.end();   
  });  
  return promise;    
}
//--------------------------------------------------------------------------------------------------------------------------------
//update
//--------------------------------------------------------------------------------------------------------------------------------
export async function update(db_schema : string,db_request : string,db_table_data : string, callback ? : t_callback,payload ? : any) {
  
  const promise =  new Promise(function (resolve, reject) {
       
    var hdr = {
      'Content-Type'    : 'application/json',
      'Content-Profile' : db_schema,
      'Prefer'          : 'return=representation',
      'Authorization'   : `Bearer ${login_jwt_token}`
  };
    
    var body = '';

    //console.log('update');
    //console.log(login_jwt_token);
  
    const req = request(
      {       
        port : request_port,
        path: "/"+db_request,    
        method: 'PATCH',
        headers: hdr         
      },
      response => {        
        
        response.on('data', function(chunk) {      
          body += chunk;
          });   
        response.on('end', function() {                   
            //console.log(body);      
            let result      = JSON.parse(body);
            if (typeof callback !== 'undefined') { 
              callback({ "result_value" : result, "payload_value" : payload});                
            }
          });     
      }
    ); 
    req.write(db_table_data);
    req.end();   
    });  
    return promise; 
}

//--------------------------------------------------------------------------------------------------------------------------------
//update sdp
//--------------------------------------------------------------------------------------------------------------------------------
export  function execute_cmd(cmd : object, callback ? : t_callback) {    

  const promise =  new Promise(function (resolve, reject) {


    const data = JSON.stringify({
        cmd              : cmd        
    });
    
    var hdr = {      
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        'Content-Length': data.length                
    };
    
    var body = '';

    const req = request(
      {       
        port : request_port,
        path: 'rpc/execute_cmd',    
        method: 'POST',
        headers: hdr         
      },
      response => {        
        
        response.on('data', function(chunk) {      
          body += chunk;
          });   
        response.on('end', function() {            
            let result      = JSON.parse(body);           
            if (typeof callback !== 'undefined') {              
              callback(result);
            }
          });     
      }
    );     
    req.write(data);  
    req.end();   
    });  
    return promise; 
}