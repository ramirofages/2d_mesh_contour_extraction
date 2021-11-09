import {Object3D} from 'three';
import {BufferAttribute} from 'three';
import {MeshLambertMaterial} from 'three';
import {ArrayUtilities} from 'ohzi-core';
import {MeshBatcher} from 'ohzi-core';
import FloorPlanForExport from './FloorPlanForExport';
import Splitter from './operators/Splitter';

export default class FloorPlan extends Object3D
{
  constructor(
    name,
    {
      unit_contours  = [],
      slab_contours  = [],
      wall_contours  = [],
      details_meshes = []
    }
  )
  {
    super();

    this.name = name;
    this.unit_contours    = unit_contours;
    this.slab_contours    = slab_contours;
    this.wall_contours    = wall_contours;
    this.details_meshes   = details_meshes;

    let contours = [];
    ArrayUtilities.merge_from_to(unit_contours, contours)
    ArrayUtilities.merge_from_to(slab_contours, contours)
    ArrayUtilities.merge_from_to(wall_contours, contours)
    ArrayUtilities.merge_from_to(details_meshes, contours)

    this.contours = contours.reduce((map, obj) => {
        map[obj.name] = obj;
        return map;
    }, {});




    this.generate_2D_mesh();

  }

  generate_2D_mesh()
  {
    this.generate_mesh();
  }

  generate_mesh(
    unit_shrink_amount        = 0, 
    unit_extrude_amount       = 0, 
    floor_slab_extrude_amount = 0, 
    wall_extrude_amount       = 0
  )
  {
    if(this.children.length > 0)
    {
      while(this.children.length > 0)
      {
        let root = this.children[0];
        for(let i=0; i< root.children.length; i++)
        {
          root.children[i].geometry.dispose();
          root.children[i].material.dispose();
        }
        this.remove(this.children[0]);
      }
    }

    let root = new Object3D();
    this.add(root);

    for(let i=0; i< this.unit_contours.length; i++)
    {
      this.unit_contours[i].reset();
      this.unit_contours[i].shrink_away_from_contours(unit_shrink_amount, this.unit_contours);
      let extruded_mesh = this.unit_contours[i].get_extruded_mesh(unit_extrude_amount);
      root.add(extruded_mesh);
    }
    for(let i=0; i< this.slab_contours.length; i++)
    {
      let extruded_mesh = this.slab_contours[i].get_extruded_mesh(floor_slab_extrude_amount);
      root.add(extruded_mesh);
    }
    for(let i=0; i< this.wall_contours.length; i++)
    {
      let extruded_mesh = this.wall_contours[i].get_extruded_mesh(wall_extrude_amount);
      root.add(extruded_mesh);
    }

    for(let i=0; i< this.details_meshes.length; i++)
    {
      if(this.details_meshes[i].geometry.index)
        this.details_meshes[i].geometry = this.details_meshes[i].geometry.toNonIndexed();

      root.add(this.details_meshes[i]);
    }
  }

  clone()
  {
    let unit_contours  = [];
    let slab_contours  = [];
    let wall_contours  = [];

    for(let i=0; i< this.unit_contours.length; i++)
    {
      unit_contours.push(this.unit_contours[i].clone());
    }

    for(let i=0; i< this.slab_contours.length; i++)
    {
      slab_contours.push(this.slab_contours[i].clone());
    }

    for(let i=0; i< this.wall_contours.length; i++)
    {
      wall_contours.push(this.wall_contours[i].clone());
    }

    for(let i=0; i< this.unit_contours.length; i++)
    {
      unit_contours.push(this.unit_contours[i].clone());
    }

    return new FloorPlan({
      unit_contours: unit_contours,
      slab_contours: slab_contours,
      wall_contours: wall_contours,
      details_meshes: this.details_meshes
    })
  }

  split_contour(mesh_name, point_a, point_b)
  {
    let contour = this.contours[mesh_name];
    let new_contours = new Splitter(contour).split(point_a, point_b);

    if(this.unit_contours.contains(contour))
    {
      ArrayUtilities.remove_elem(this.unit_contours, contour)
      this.unit_contours.push(...new_contours);
    }
    if(this.slab_contours.contains(contour))
    {
      ArrayUtilities.remove_elem(this.slab_contours, contour)
      this.slab_contours.push(...new_contours);

    }
    if(this.wall_contours.contains(contour))
    {
      ArrayUtilities.remove_elem(this.wall_contours, contour)
      this.wall_contours.push(...new_contours);
    }

    this.generate_mesh(0.2, 1, 0.1, 1.5);
  }


  build_for_export()
  {
    let floor_plan_for_export = new FloorPlanForExport(this.children[0]);

  }
}