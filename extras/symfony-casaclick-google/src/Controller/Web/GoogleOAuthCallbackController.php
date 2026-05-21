<?php

declare(strict_types=1);

namespace App\Controller\Web;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Target route name for HWIOAuthBundle (redirect_route: auth_google_callback).
 *
 * For production you typically **issue a JWT here** (or redirect to the SPA with a short-lived code),
 * after HWI has authenticated the user. This stub returns JSON so you can verify routing.
 */
final class GoogleOAuthCallbackController extends AbstractController
{
    #[Route('/auth/google/callback', name: 'auth_google_callback', methods: ['GET'])]
    public function __invoke(): Response
    {
        return new JsonResponse([
            'message' => 'HWI OAuth callback reached. Replace this with JWT issuance or SPA redirect.',
        ]);
    }
}
