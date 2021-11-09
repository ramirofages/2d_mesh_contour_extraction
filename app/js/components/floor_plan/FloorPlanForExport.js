import {Object3D} from 'three';
import {BufferAttribute} from 'three';
import {MeshLambertMaterial} from 'three';
import {ArrayUtilities} from 'ohzi-core';
import {MeshBatcher} from 'ohzi-core';

export default class FloorPlanForExport extends Object3D
{
  constructor(floor_plan_meshes)
  {
    super();
    

    let meshes = floor_plan_meshes;

    for(let i=0; i< meshes.length; i++)
    {
      let mesh           = meshes[i];
      let geometry       = mesh.geometry;
      let material_color = mesh.material.color;

      geometry.deleteAttribute('uv');

      let vertex_count = geometry.getAttribute('position').count;
      let color_attr   = new BufferAttribute(new Uint8Array(vertex_count*4), 4, true);

      for(let color_i = 0; color_i < vertex_count; color_i++)
      {
        color_attr.array[color_i*4+0] = material_color.r * 255;
        color_attr.array[color_i*4+1] = material_color.g * 255;
        color_attr.array[color_i*4+2] = material_color.b * 255;
        color_attr.array[color_i*4+3] = 255;
      }

      geometry.setAttribute('color', color_attr);
    }

    let mesh = new MeshBatcher().batch(meshes, new MeshLambertMaterial({color: "#FFFFFF"}));
    mesh.material.vertexColors = true;
    mesh.name = 'merged';
    let colliders = new Object3D();
    colliders.name = 'colliders';

    for(let i=0; i< meshes.length; i++)
    {
      let mesh = meshes[i];
      mesh.geometry.deleteAttribute('color');
      mesh.geometry.deleteAttribute('normal');
      colliders.add(mesh);
    }

    colliders.visible = false;
    
    this.add(colliders);
    this.add(mesh);
  }
}