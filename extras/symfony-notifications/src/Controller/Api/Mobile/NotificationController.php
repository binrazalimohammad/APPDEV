<?php

declare(strict_types=1);

namespace App\Controller\Api\Mobile;

use App\Entity\Notification;
use App\Entity\User;
use App\Repository\NotificationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/mobile/notifications')]
#[IsGranted('ROLE_USER')]
class NotificationController extends AbstractController
{
    public function __construct(private NotificationRepository $notifications)
    {
    }

    #[Route('', name: 'api_mobile_notifications_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $items = $this->notifications->findForUser($user);
        $unread = $this->notifications->countUnreadForUser($user);

        return $this->json([
            'success' => true,
            'data' => array_map(static fn (Notification $n) => $n->toMobileArray(), $items),
            'meta' => ['unread' => $unread, 'count' => count($items)],
        ]);
    }

    #[Route('/{id}/read', name: 'api_mobile_notifications_read', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function markRead(Notification $notification): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        if ($notification->getUser()?->getId() !== $user->getId()) {
            return $this->json(['success' => false, 'error' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        $notification->setIsRead(true);
        $this->notifications->getEntityManager()->flush();

        return $this->json(['success' => true, 'data' => $notification->toMobileArray()]);
    }

    #[Route('/read-all', name: 'api_mobile_notifications_read_all', methods: ['POST'])]
    public function markAllRead(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $updated = $this->notifications->markAllReadForUser($user);

        return $this->json(['success' => true, 'meta' => ['updated' => $updated]]);
    }
}
