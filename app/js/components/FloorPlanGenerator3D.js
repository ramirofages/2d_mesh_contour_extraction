import MeshContour from './MeshContour';

export default class FloorPlanGenerator3D
{
  constructor()
  {

  }

  convert(meshes)
  {
    let regex_units = new RegExp('^Units*')
    let regex_slabs = new RegExp('^Slabs*')
    let regex_walls = new RegExp('^Walls*')

    let extruded_meshes = [];

    let unit_meshes = [];
    let slab_meshes = [];
    let wall_meshes = [];

    let other_meshes = [];

    let unit_neighboor_loops = [];

    for(let i=0; i < meshes.length; i++)
    {
      if(regex_units.test(meshes[i].parent.name) === true || 
         regex_slabs.test(meshes[i].parent.name) === true || 
         regex_walls.test(meshes[i].parent.name) === true)
      {
        let mesh_contour = new MeshContour(meshes[i]);
        if(mesh_contour.edge_groups.length > 0)
        { 
          if(regex_units.test(meshes[i].parent.name) === true)
          {
            unit_meshes.push(mesh_contour);
            unit_neighboor_loops.push(mesh_contour.edge_groups[0]);
          }
          if(regex_slabs.test(meshes[i].parent.name) === true)
          {
            slab_meshes.push(mesh_contour);
          }
          if(regex_walls.test(meshes[i].parent.name) === true)
          {
            wall_meshes.push(mesh_contour);
          }
        }
        else
        {
          console.error("mesh does not contain enough edges ", meshes[i], mesh_contour)
        }
      }
      else
      {
        other_meshes.push(meshes[i])
      }
      

    }

    for(let i=0; i< unit_meshes.length; i++)
    {
      let extruded_mesh = unit_meshes[i].get_extruded_mesh(1, 0.2, unit_neighboor_loops);
      extruded_meshes.push(extruded_mesh);
    }
    for(let i=0; i< slab_meshes.length; i++)
    {
      let extruded_mesh = slab_meshes[i].get_extruded_mesh(0.1);
      extruded_meshes.push(extruded_mesh);
    }
    for(let i=0; i< wall_meshes.length; i++)
    {
      let extruded_mesh = wall_meshes[i].get_extruded_mesh(1.5);
      extruded_meshes.push(extruded_mesh);
    }

    for(let i=0; i< other_meshes.length; i++)
    {
      if(other_meshes[i].geometry.index)
        other_meshes[i].geometry = other_meshes[i].geometry.toNonIndexed();

      extruded_meshes.push(other_meshes[i]);
    }
    return extruded_meshes;
  }
}