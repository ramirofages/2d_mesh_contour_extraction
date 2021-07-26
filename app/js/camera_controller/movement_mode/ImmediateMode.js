
import CameraMovementMode from './CameraMovementMode';

import { Vector2 } from 'three';
import { Vector3 } from 'three';
import { Quaternion } from 'three';
import { Math as TMath } from 'three';

export default class ImmediateMode extends CameraMovementMode
{
  constructor()
  {
    super();
    this.rotation_speed = new Vector2();

    this.vector_forward_axis = new Vector3(0, 0, -1);
    this.tmp_forward = new Vector3();

    this.tmp_quat = new Quaternion();
    this.tmp_camera_target_pos = new Vector3();
  }

  on_enter(camera_controller)
  {
    camera_controller.reference_rotation.copy(camera_controller.camera.quaternion);
  }

  update(camera_controller)
  {
    camera_controller.camera.quaternion.copy(camera_controller.reference_rotation);

    this.tmp_forward.copy(this.vector_forward_axis);
    let dir = this.tmp_forward.applyQuaternion(camera_controller.camera.quaternion);

    camera_controller.reference_zoom = TMath.clamp(camera_controller.reference_zoom,
      camera_controller.min_zoom, camera_controller.max_zoom);

    camera_controller.camera.position.copy(camera_controller.reference_position).sub(dir.multiplyScalar(camera_controller.reference_zoom));

    camera_controller.__last_reference_position.copy(camera_controller.reference_position);
  }

  get_target_camera_pos(camera_controller)
  {
    this.tmp_quat.copy(camera_controller.reference_rotation);
    this.tmp_forward.copy(this.vector_forward_axis);

    let dir = this.tmp_forward.applyQuaternion(this.tmp_quat);

    let zoom = TMath.clamp(camera_controller.reference_zoom,
      camera_controller.min_zoom, camera_controller.max_zoom);

    this.tmp_camera_target_pos.copy(camera_controller.reference_position).sub(dir.multiplyScalar(zoom));
    return this.tmp_camera_target_pos;
  }
}
