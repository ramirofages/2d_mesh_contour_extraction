import Contour from './Contour';
import FloorPlan from './FloorPlan';
export default class FloorPlanGenerator
{
  constructor()
  {

  }

  build_from_scene(name, scene)
  {
    let meshes = [];

    scene.traverse(child=>{
      if(child.geometry)
      {
        meshes.push(child);
      }
    });
    return this.build(name, meshes);
  }
  build(name, meshes)
  {
    let regex_units = new RegExp('^Units*')
    let regex_slabs = new RegExp('^FloorSlabs*')
    let regex_walls = new RegExp('^Walls*')

    let extruded_meshes = [];

    let unit_contours = [];
    let slab_contours = [];
    let wall_contours = [];
    let details_meshes = [];

    let unit_neighboor_loops = [];

    for(let i=0; i < meshes.length; i++)
    {
      if(regex_units.test(meshes[i].parent.name) === true || 
         regex_slabs.test(meshes[i].parent.name) === true || 
         regex_walls.test(meshes[i].parent.name) === true)
      {
        let mesh = meshes[i];
        let contour = new Contour(mesh.name, "#"+mesh.material.color.getHexString());
        contour.set_from_mesh(mesh)
        if(contour.edge_loops.length > 0)
        { 
          if(regex_units.test(mesh.parent.name) === true)
          {
            unit_contours.push(contour);
            unit_neighboor_loops.push(contour.edge_loops[0]);
          }
          if(regex_slabs.test(mesh.parent.name) === true)
          {
            slab_contours.push(contour);
          }
          if(regex_walls.test(mesh.parent.name) === true)
          {
            wall_contours.push(contour);
          }
        }
        else
        {
          console.error("mesh does not contain enough edges ", mesh, contour)
        }
      }
      else
      {
        details_meshes.push(meshes[i])
      }
    }

    return new FloorPlan(name, {
      unit_contours: unit_contours,
      slab_contours: slab_contours,
      wall_contours: wall_contours,
      details_meshes: details_meshes
    });
  }
}