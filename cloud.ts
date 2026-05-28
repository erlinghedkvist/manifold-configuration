// cloud.ts
// -----------------------------------------------------------------------------
// Global configuration for manifold CLOUD.
// This file defines system-wide building blocks used by all clusters:
//  - Authentication (users/roles)
//  - Hardware inventory (servers, accelerator cards, AFUs, pools)
//  - License keys/pools
//  - Cluster-wide networking/IP/MAC resources and multicast ranges
//  - Cluster defaults (PTP, control protocols, NMOS, routing modes, etc.)
// -----------------------------------------------------------------------------


export let manifold_cloud_configuration = [

  // ===========================================================================
  // AUTHENTICATION
  // ===========================================================================
  {
    // Defines interactive users and their roles across the cloud.
    "db_schema": "basic_auth",
    "db_table": "users",
    "db_table_data": [
      {
        // Default admin user (change in production!)
        "username": "admin",
        "pass": "password",
        // Grants admin across cloud and clusters.
        "role": "cloud_cluster_admin"
      }
    ]
  },

  // ===========================================================================
  // HARDWARE INVENTORY
  // ===========================================================================
  //
  // This section defines all available accelerator servers and FPGA cards.
  // Each accelerator must declare its type so manifold CLOUD knows how to
  // interface with the device.
  //
  // Currently supported accelerator types (MANDATORY values):
  //   - "Bittware:520N-MX"
  //   - "prodesign:FALCON-Stratix"
  //   - "arkona:AT300"
  //
  // If the type string does not match one of these exactly, the card will
  // not be recognized or usable by manifold CLOUD.
  //
  //  Server’s out-of-band/control NIC MAC (currently not used)
  //    -  "ctrl_macaddr": "50:eb:f6:bc:c5:93"
  // Friendly name of the host server
  //    -  "name": "Server 1"

  // Accelerator servers (physical hosts that carry FPGA accelerators)
  {
    "db_schema": "hardware",
    "db_table": "accelerators_servers",
    "db_table_data": [
      {"ctrl_macaddr": "50:eb:f6:bc:c5:93","name": "Server 1"}
  // Uncomment/add as your inventory grows, e.g.:
  // {"ctrl_macaddr":"50:eb:f6:bc:c5:94","name":"Server 2"},
    ]
  },

  // Accelerator cards (per-slot enumeration of FPGA boards on servers)
  // 0-based index of the accelerator card on the server
  //   -   "on_server_id": 0
  // Reference to accelerators_servers row (1-based)
  //    -  "accelerators_server_id": 1
  // Accelerator type: REQUIRED field so manifold CLOUD knows which
  // hardware it is programming. Must be one of the supported types above.
  //    -  "accelerator_type": "prodesign:FALCON-Stratix"
  {
    "db_schema": "hardware",
    "db_table": "accelerators",
    "db_table_data": [
      {"on_server_id": 0,"accelerators_server_id": 1,"accelerator_type": "prodesign:FALCON-Stratix"}
    // Uncomment/add as your inventory grows, e.g.:
    // {"on_server_id":1,"accelerators_server_id":1,"accelerator_type":"prodesign:FALCON-Stratix"},
    // {"on_server_id":2,"accelerators_server_id":1,"accelerator_type":"prodesign:FALCON-Stratix"},
    // {"on_server_id":0,"accelerators_server_id":2,"accelerator_type":"Bittware:520N-MX"},
    // {"on_server_id":1,"accelerators_server_id":2,"accelerator_type":"Bittware:520N-MX"},
    // {"on_server_id":2,"accelerators_server_id":2,"accelerator_type":"Bittware:520N-MX"},
    // {"on_server_id":3,"accelerators_server_id":2,"accelerator_type":"Bittware:520N-MX"}
    ]
  },

  // Hardware pools: group AFUs (Accelerator Function Units) into clusters
  {
    "db_schema": "hardware",
    "db_table": "pool",
    "db_table_data": [
      {
        // Human-readable pool name
        "name": "Cluster 1 HW pool"
      }
    ]
  },

  // Map AFUs into the hardware pool. Current generation FPGA accelerators have 2 AFUs per card.
  {
    "db_schema": "hardware",
    "db_table": "pool_afus",
    "db_table_data": [
      { "pool_id": 1, "afu_id": 1 },
      { "pool_id": 1, "afu_id": 2 }
    ]
  },

  // ===========================================================================
  // LICENSE MANAGEMENT
  // ===========================================================================
  {
    "db_schema": "license",
    "db_table": "keys",
    "db_table_data": [
      {
        // Placeholder key; replace with your actual license metadata
        "name"  : "license key 1",
        "token": ""
      }
    ]
  },
  {
    "db_schema": "license",
    "db_table": "pool",
    "db_table_data": [
      {
        // Pools make it easier to assign multiple keys to clusters
        "name": "license pool 1"
      }
    ]
  },

  // ===========================================================================
  // CLUSTER NETWORKING RESOURCES
  // ===========================================================================
  {
    "db_schema": "cluster",
    "db_table": "cluster_ip_addresses_lists",
    "db_table_data": [
      { "name": "Cluster 1 ports ip addresses" }
    ]
  },
  {
    "db_schema": "cluster",
    "db_table": "cluster_mac_addresses_lists",
    "db_table_data": [
      { "name": "Cluster 1 ports mac addresses" }
    ]
  },
  {
    "db_schema": "cluster",
    "db_table": "cluster_ip_addresses_lists_addresses",
    "db_table_data": [
      { "cluster_ip_addresses_list_id": 1, "on_list_id": 0, "ip_address": "172.16.224.0" },
      { "cluster_ip_addresses_list_id": 1, "on_list_id": 1, "ip_address": "172.16.224.1" },
      { "cluster_ip_addresses_list_id": 1, "on_list_id": 2, "ip_address": "172.16.224.2" },
      { "cluster_ip_addresses_list_id": 1, "on_list_id": 3, "ip_address": "172.16.224.3" },
      { "cluster_ip_addresses_list_id": 1, "on_list_id": 4, "ip_address": "10.20.0.13" },
      { "cluster_ip_addresses_list_id": 1, "on_list_id": 5, "ip_address": "10.30.0.13" },
      { "cluster_ip_addresses_list_id": 1, "on_list_id": 6, "ip_address": "10.20.0.14" },
      { "cluster_ip_addresses_list_id": 1, "on_list_id": 7, "ip_address": "10.30.0.14" }
    ]
  },
  {
    "db_schema": "cluster",
    "db_table": "cluster_mac_addresses_lists_addresses",
    "db_table_data": [
      { "cluster_mac_addresses_list_id": 1, "on_list_id": 0, "mac_address": "00:50:c2:f6:00:00" },
      { "cluster_mac_addresses_list_id": 1, "on_list_id": 1, "mac_address": "00:50:c2:f6:00:01" },
      { "cluster_mac_addresses_list_id": 1, "on_list_id": 2, "mac_address": "00:50:c2:f6:00:02" },
      { "cluster_mac_addresses_list_id": 1, "on_list_id": 3, "mac_address": "00:50:c2:f6:00:03" },
      { "cluster_mac_addresses_list_id": 1, "on_list_id": 4, "mac_address": "00:50:c2:f6:00:04" },
      { "cluster_mac_addresses_list_id": 1, "on_list_id": 5, "mac_address": "00:50:c2:f6:00:05" },
      { "cluster_mac_addresses_list_id": 1, "on_list_id": 6, "mac_address": "00:50:c2:f6:00:06" },
      { "cluster_mac_addresses_list_id": 1, "on_list_id": 7, "mac_address": "00:50:c2:f6:00:07" }
    ]
  },

// ===========================================================================
  // CLUSTERS: DEFINITIONS & DEFAULTS
  // (Global declaration of a cluster and its baseline runtime settings)
  // ===========================================================================
  {
    "db_schema": "cluster",
    "db_table": "clusters",
    "db_table_data": [
      {
        // Human-friendly cluster name
        "name": "Manifold Cluster 1",

        // Optional manual UUID for deterministic identity.
        // If not provided, one is auto-generated at cluster creation.
        // When registering with an NMOS registry the cluster
        // appears as a stable, unique "device" across reboots/restarts.
        "id_uuid": "c1a92ebe-fe73-46ba-8f15-e9f35ea01ae5",

        // --------------------------
        // Per-port MAC addressing
        // --------------------------
        // network_ports_mac_address_assignment_mode options (MANDATORY):
        //   - "manual" : use MACs from the defined list
        //   - "auto"   : auto-generate sequential MACs from a base
        "network_ports_mac_address_assignment_mode": "auto",
        // If above is 'manual', entries come from this MAC list id
        "network_ports_address_mac_addresses_list_id": 1,
        // If above is 'auto', this is the base MAC to auto-increment from
        "network_ports_auto_mac_address_start": "00:50:c2:f6:cb:b5",
        // Increment step for auto MAC allocation
        "network_ports_auto_mac_address_inc": 1,

        // --------------------------
        // Per-port IP addressing
        // --------------------------
        // network_ports_address_assignment_mode options:
        //   - "manual" : use IPs from the defined list
        //   - "auto"   : auto-generate sequential IPs from a base
        "network_ports_address_assignment_mode": "manual",
        // If 'manual', entries come from this IP list id
        "network_ports_address_ip_addresses_list_id": 1,
        // If 'auto', base IP for sequential allocation
        "network_ports_auto_ip_address_start": "172.16.110.0",
        // If 'auto', number of addresses to pre-allocate
        "network_ports_auto_ip_address_num": 16,

        // --------------------------
        // Ingress routing mode
        // --------------------------
        // Configure how inputs to manifold CLOUD are received:
        //       - "sps"   : seamless protection switching (ST2022-7)
        //       - "auto"  : automatic load balancing across both NICs in the AFU
        //       - "afu0"  : inputs only via AFU interface 0
        //       - "afu1"  : inputs only via AFU interface 1
        "ingress_sources_routing_mode": "sps",

        // PTP
        "ptp_enable": true,
        "ptp_domain_number": 127,


        // --------------------------
        // External control protocols
        // --------------------------
        // Ember+ control port
        "ember_port": 9000,

        // TSL UMD v5 (tally/labels) ports
        "tsl_udp_port": 8800,
        "tsl_tcp_port": 8801,

        // Optional configuration for multiple TSL v5 connections:
        //
        //   - "tsl_connections_num" : how many parallel TSL connections to expose
        //                           (default = 1)
        //
        //   - "tsl_screens_per_connection" : how many multiviewer heads ("screens")
        //                                  are mapped per TSL connection
        //                                  (default = 65535)
        //
        // Example:
        //   If a control system can only handle 10 multiviewer heads per TSL
        //   connection, but your cluster has 50 heads in total, configure as:
        //
        //     "tsl_screens_per_connection": 10,
        //     "tsl_connections_num": 5
        //
        // This will spread the 50 heads across 5 TSL connections with 10 heads each.
        //
        // "tsl_connections_num": 20,            // (default 1)
        // "tsl_screens_per_connection": 1       // (default 65535)

        // --------------------------
        // NMOS registry/advertising
        // --------------------------
        // IS-04/IS-05 registry URL for resource discovery and connection
        "nmos_registry_url": "http://0.0.0.0:30010",
        // Hosts/IPs to advertise as senders/receivers in registry. This is normally the mgmt IP of the server
        "nmos_advertised_hosts": ["0.0.0.0"]
      }
    ]
  },


  // ===========================================================================
  // AUTO IP ADDRESS RANGES (ALLOCATES MULTICAST ADDRESSES PER SERVICE)
  // Defines a pool of addresses from which services (resolution levels (mipmaps), Multiviewer heads,
  // Graphics inserters, etc.) in the cluster allocate their multicast addresses.
  // Primary is always used while secondary is used if the service is configured as SPS (ST2022-7).
  //
  // Fields:
  //   - cluster_id:           Which cluster this range belongs to
  //   - on_cluster_id:        Order/index of this range
  //   - name:                 Friendly description
  //   - ip_addresses_start:   Base multicast start (inclusive)
  //   - ip_addresses_num:     How many addresses are in the block
  //   - inc_mode    : "X_X_1_1" or "X_1_X_1"
  //   - sources_routing_mode: MANDATORY
  //        Configures how outputs from manifold CLOUD
  //        (services and mipmap resolution levels) are sent
  //        out from the accelerators. Options :
  //       - "sps"   : seamless protection switching (ST2022-7)
  //       - "auto"  : automatic load balancing across both NICs
  //       - "afu0"  : outputs only via AFU interface 0
  //       - "afu1"  : outputs only via AFU interface 1
  //   - udp_dst_port/src_port: RTP/UDP transport ports (e.g. 10001)
  //   - rtp_payload_type: RTP payload type (e.g. 97 for ST2110-20 video)
  // ===========================================================================
  {
    "db_schema": "cluster",
    "db_table": "cluster_auto_ip_addresses_ranges",
    "db_table_data": [
      {
        "cluster_id": 1,
        "on_cluster_id": 0,
        "name": "RL Generators IP Range Primary",
        "ip_addresses_start": "239.120.1.0",
        "ip_addresses_num": 768,
        "inc_mode": "X_X_1_1",
        "sources_routing_mode": "sps",
        "udp_dst_port": 10001,
        "rtp_payload_type": 97,
        "udp_src_port": 9000
      },
      {
        "cluster_id": 1,
        "on_cluster_id": 1,
        "name": "RL Generators IP Range Secondary",
        "ip_addresses_start": "239.121.1.0",
        "ip_addresses_num": 768,
        "inc_mode": "X_X_1_1",
        "sources_routing_mode": "sps",
        "udp_dst_port": 10001,
        "rtp_payload_type": 97,
        "udp_src_port": 9000
      },
      {
        "cluster_id": 1,
        "on_cluster_id": 2,
        "name": "Video Test Patterns IP Range Primary",
        "ip_addresses_start": "239.90.60.0",
        "ip_addresses_num": 1024,
        "inc_mode": "X_X_1_1",
        "sources_routing_mode": "sps",
        "udp_dst_port": 10001,
        "rtp_payload_type": 97,
        "udp_src_port": 9000
      },
      {
        "cluster_id": 1,
        "on_cluster_id": 3,
        "name": "Video Test Patterns IP Range Secondary",
        "ip_addresses_start": "239.91.60.0",
        "ip_addresses_num": 1024,
        "inc_mode": "X_X_1_1",
        "sources_routing_mode": "sps",
        "udp_dst_port": 10001,
        "rtp_payload_type": 97,
        "udp_src_port": 9000
      },
      {
        "cluster_id": 1,
        "on_cluster_id": 4,
        "name": "HTML5 GFX Inserters IP Range Primary",
        "ip_addresses_start": "239.90.4.0",
        "ip_addresses_num": 1024,
        "inc_mode": "X_X_1_1",
        "sources_routing_mode": "sps",
        "udp_dst_port": 10001,
        "rtp_payload_type": 97,
        "udp_src_port": 9000
      },
      {
        "cluster_id": 1,
        "on_cluster_id": 5,
        "name": "HTML5 GFX Inserters IP Range Secondary",
        "ip_addresses_start": "239.91.4.0",
        "ip_addresses_num": 1024,
        "inc_mode": "X_X_1_1",
        "sources_routing_mode": "sps",
        "udp_dst_port": 10001,
        "rtp_payload_type": 97,
        "udp_src_port": 9000
      },
      {
        "cluster_id": 1,
        "on_cluster_id": 6,
        "name": "Video Input Bridge IP Range Primary",
        "ip_addresses_start": "239.90.24.0",
        "ip_addresses_num": 1024,
        "inc_mode": "X_X_1_1",
        "sources_routing_mode": "sps",
        "udp_dst_port": 10001,
        "rtp_payload_type": 97,
        "udp_src_port": 9000
      },
      {
        "cluster_id": 1,
        "on_cluster_id": 7,
        "name": "Video Input Bridge IP Range Secondary",
        "ip_addresses_start": "239.91.24.0",
        "ip_addresses_num": 1024,
        "inc_mode": "X_X_1_1",
        "sources_routing_mode": "sps",
        "udp_dst_port": 10001,
        "rtp_payload_type": 97,
        "udp_src_port": 9000
      },
      {
        "cluster_id": 1,
        "on_cluster_id": 10,
        "name": "Multiviewer Heads IP Range Primary",
        "ip_addresses_start": "238.90.16.0",
        "ip_addresses_num": 254,
        "inc_mode": "X_X_1_1",
        "sources_routing_mode": "sps",
        "udp_dst_port": 9000,
        "rtp_payload_type": 97,
        "udp_src_port": 9000
      },
      {
        "cluster_id": 1,
        "on_cluster_id": 11,
        "name": "Multiviewer Heads IP Range Secondary",
        "ip_addresses_start": "238.91.16.0",
        "ip_addresses_num": 254,
        "inc_mode": "X_X_1_1",
        "sources_routing_mode": "sps",
        "udp_dst_port": 9000,
        "rtp_payload_type": 97,
        "udp_src_port": 9000
      }
    ]
  },

  // ===========================================================================
  // CLUSTER → RESOURCE ASSIGNMENTS
  // ===========================================================================
  {
    "db_schema": "cluster",
    "db_table": "cluster_hw_pools",
    "db_table_data": [
      { "cluster_id": 1, "pool_id": 1 }
    ]
  },
  {
    "db_schema": "cluster",
    "db_table": "cluster_license_pools",
    "db_table_data": [
      { "cluster_id": 1, "pool_id": 1 }
    ]
  },
  {
    "db_schema": "cluster",
    "db_table": "cluster_users",
    "db_table_data": [
      { "cluster_id": 1, "user_id": 1 }
    ]
  }
];
