<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Google\Client as GoogleClient;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

/**
 * POST /api/auth/google
 * Body: { "idToken": "<Google ID token from React Native>" }
 * Response: { "token": "<Lexik JWT>" }
 *
 * IMPORTANT: Adapt User creation to your project's User entity fields and repository.
 */
final class GoogleTokenAuthController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly string $googleClientId,
    ) {
    }

    #[Route('/api/auth/google', name: 'api_auth_google', methods: ['POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true) ?? [];
        $idToken = $body['idToken'] ?? null;
        if (!$idToken || !is_string($idToken)) {
            return new JsonResponse(['detail' => 'idToken is required'], 400);
        }

        $client = new GoogleClient(['client_id' => $this->googleClientId]);
        $payload = $client->verifyIdToken($idToken);
        if (!$payload) {
            return new JsonResponse(['detail' => 'Invalid Google token'], 401);
        }

        /** @var array<string,mixed> $claims */
        $claims = $payload;
        $email = isset($claims['email']) ? (string) $claims['email'] : '';
        if ($email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            return new JsonResponse(['detail' => 'Google token has no valid email'], 400);
        }

        $repository = $this->em->getRepository(User::class);
        /** @var User|null $user */
        $user = $repository->findOneBy(['email' => $email]);

        if (!$user) {
            /** @phpstan-ignore-next-line */
            $user = new User();
            if (!method_exists($user, 'setEmail')) {
                return new JsonResponse(['detail' => 'User entity must implement setEmail()'], 500);
            }
            $user->setEmail($email);

            $randomPassword = bin2hex(random_bytes(16));
            if (method_exists($user, 'setPassword')) {
                $user->setPassword($this->passwordHasher->hashPassword($user, $randomPassword));
            }

            // Optional: persist Google subject
            if (isset($claims['sub']) && method_exists($user, 'setGoogleId')) {
                $user->setGoogleId((string) $claims['sub']);
            }

            $this->em->persist($user);
            $this->em->flush();
        }

        $token = $this->jwtManager->create($user);

        return new JsonResponse([
            'token' => $token,
            'user' => [
                'email' => $email,
            ],
        ]);
    }
}
