import express from 'express';
import { getInnovatorProfileController, updateInnovatorProfileController } from '../controllers/innovator.controller';
import { upload } from '../middleware/upload.middleware';
import { updateProfilePictureController } from '../controllers/innovator.controller';

const router = express.Router();


router.get('/innovator/:user_id/profile', getInnovatorProfileController);

router.put('/innovator/:user_id/profile/update', updateInnovatorProfileController);


router.put(
    '/innovator/:user_id/profile-picture',
    upload.single('profile_picture'),  
    updateProfilePictureController
  );


export default router;
