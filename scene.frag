#version 450

layout( location = 0 ) in vec3 vert_normal;
layout( location = 1 ) in vec4 vert_texcoords;
layout( location = 2 ) in vec3 vert_light;
layout(location = 3) in vec4 Position;
layout(location = 4) in vec4 lp;

layout( set = 0, binding = 1 ) uniform sampler2D ShadowMap;

layout( location = 0 ) out vec4 frag_color;



vec3 LightIntensity = vec3(1.0, 0.0, 0.0);
vec3 MaterialKd = vec3(1.0, 1.0, 1.0);
vec3 MaterialKs = vec3(1.0, 0.5, 0.0);
vec3 MaterialKa = vec3(0.0, 0.025, 0.075);
float MaterialShininess = 10.0;



vec3 phongModelDiffAndSpec(bool do_specular)
{
  vec3 normal_vector = normalize( vert_normal );



    vec3 n = normal_vector;
    vec3 s = normalize(lp.xyz - Position.xyz);
    vec3 v = normalize(-Position.xyz);
    vec3 r = reflect( -s, n );
    float sDotN = max( dot(s,n), 0.0 );
    vec3 diffuse = LightIntensity * MaterialKd * sDotN;
    vec3 spec = vec3(0.0);

    if( sDotN > 0.0 )
    {
        spec.x = MaterialKs.x * pow( max( dot(r,v), 0.0 ), MaterialShininess );
        spec.y = MaterialKs.y * pow( max( dot(r,v), 0.0 ), MaterialShininess );
        spec.z = MaterialKs.z * pow( max( dot(r,v), 0.0 ), MaterialShininess );
    }

    vec3 n2 = normal_vector;
    vec3 s2 = normalize(lp.xyz - Position.xyz);
    vec3 v2 = normalize(-Position.xyz);
    vec3 r2 = reflect( -s2, n2 );
    float sDotN2 = max( dot(s2,n2)*0.5f, 0.0 );
    vec3 diffuse2 = LightIntensity*0.25 * MaterialKa * sDotN2;

    float k = (1.0 - sDotN)/2.0;
    vec3 ret = diffuse + diffuse2 + MaterialKa*k;

    if(do_specular)
        ret = ret + spec;
    
    return ret;
}


void main()
{
  float shadow = 1.0;
  vec4 shadow_coords = vert_texcoords / vert_texcoords.w;
  
  if( texture( ShadowMap, shadow_coords.xy ).r < shadow_coords.z - 0.005 )
  {
    shadow = 0.5;
  }

  
      
    vec3 diffAndSpec;
    
    
    if(shadow == 1.0)
    {
        diffAndSpec = phongModelDiffAndSpec(true);
        frag_color = vec4(diffAndSpec, 1.0);// + vec4(diffAndSpec * shadow + MaterialKa*(1.0 - shadow), 1.0);
    }
    else
    {
        diffAndSpec = phongModelDiffAndSpec(false);
        frag_color = vec4(diffAndSpec * shadow + MaterialKa*(1.0 - shadow), 1.0) + vec4(diffAndSpec, 1.0) + vec4(diffAndSpec * shadow + MaterialKa*(1.0 - shadow), 1.0);
        frag_color /= 3;
    }

    //frag_color = pow( frag_color, vec4(1.0 / 2.2) );

  

}
