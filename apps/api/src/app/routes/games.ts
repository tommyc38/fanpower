import { GamesController } from '../controllers';
import { Router } from 'express';
import { postgresService } from '../services';

const router = Router();
const gameController = new GamesController(postgresService);
const pathPrefix = '/games';

router.get(`${pathPrefix}/:id`, gameController.getGameById);
router.get(`${pathPrefix}/:id/frames`, gameController.getGameFrames);
router.patch(`${pathPrefix}/:id/frames/:frameId`, gameController.patchGameFrames);
router.get(`${pathPrefix}/:id/players`, gameController.getGamePlayers);
router.post(`${pathPrefix}/:id/players`, gameController.postGamePlayers);
router.post(pathPrefix, gameController.post);
router.patch(`${pathPrefix}/:id`, gameController.patch);

export default router;
