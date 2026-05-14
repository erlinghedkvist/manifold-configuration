tsx ./lib/utils_cloud_config.ts ../examples/configuration/cloud.ts;
tsx ./lib/utils_cluster_config.ts ../examples/configuration/cluster.ts;
tsx ./post_config.ts
#sleep 10
#ts-node ./post_config1.ts
#sleep 10
#ts-node ./post_config2.ts
