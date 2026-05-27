<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;

class NotificationService
{
    public function __construct(
        private EntityManagerInterface $em,
        private NotificationRepository $notifications,
    ) {
    }

    public function notify(
        User $recipient,
        string $type,
        string $message,
        ?string $relatedEntity = null,
        ?int $relatedId = null,
    ): Notification {
        $notification = (new Notification())
            ->setUser($recipient)
            ->setType($type)
            ->setMessage($message)
            ->setRelatedEntity($relatedEntity)
            ->setRelatedId($relatedId)
            ->setIsRead(false);

        $this->em->persist($notification);
        $this->em->flush();

        return $notification;
    }

    public function notifyApplicationStatusChange(
        User $tenant,
        string $listingName,
        string $oldStatus,
        string $newStatus,
        int $applicationId,
    ): void {
        if ($oldStatus === $newStatus) {
            return;
        }

        $label = ucwords(str_replace('_', ' ', strtolower($newStatus)));
        $this->notify(
            $tenant,
            'lease_update',
            sprintf('Your application for %s has been updated to %s', $listingName, $label),
            'application',
            $applicationId,
        );
    }

    public function notifyMaintenanceStatusChange(
        User $tenant,
        string $ticketRef,
        string $newStatus,
        int $maintenanceId,
    ): void {
        $label = ucwords(str_replace('_', ' ', strtolower($newStatus)));
        $this->notify(
            $tenant,
            'maintenance_update',
            sprintf('Your maintenance request #%s has been marked as %s', $ticketRef, $label),
            'maintenance',
            $maintenanceId,
        );
    }

    public function notifyListingStatusChange(
        User $landlord,
        string $address,
        string $newStatus,
        int $listingId,
    ): void {
        $label = ucwords(str_replace('_', ' ', strtolower($newStatus)));
        $this->notify(
            $landlord,
            'listing_update',
            sprintf('Your listed property (%s) is now %s', $address, $label),
            'listing',
            $listingId,
        );
    }

    public function notifyListingInquiry(
        User $landlord,
        string $address,
        int $listingId,
    ): void {
        $this->notify(
            $landlord,
            'inquiry',
            sprintf('A new inquiry has been received for your listed property: %s', $address),
            'listing',
            $listingId,
        );
    }

    public function notifyPaymentStatusChange(
        User $tenant,
        string $periodLabel,
        string $newStatus,
        int $paymentId,
    ): void {
        $status = strtolower($newStatus);
        $type = 'payment_update';
        $message = match (true) {
            str_contains($status, 'received') || str_contains($status, 'paid') =>
                sprintf('Your rent payment for %s has been received', $periodLabel),
            str_contains($status, 'overdue') =>
                sprintf('Your rent payment for %s is overdue', $periodLabel),
            str_contains($status, 'waiv') =>
                sprintf('Your rent payment for %s has been waived', $periodLabel),
            default =>
                sprintf('Your payment for %s is now %s', $periodLabel, ucfirst($status)),
        };

        $this->notify($tenant, $type, $message, 'payment', $paymentId);
    }

    public function notifyContractReady(User $tenant, string $listingName, int $applicationId): void
    {
        $this->notify(
            $tenant,
            'contract_update',
            sprintf('Your lease agreement for %s is ready for e-signature', $listingName),
            'application',
            $applicationId,
        );
    }

    public function notifyOnboardingStep(User $tenant, string $stepLabel, int $applicationId): void
    {
        $this->notify(
            $tenant,
            'onboarding_update',
            sprintf('Tenant onboarding: %s confirmed', $stepLabel),
            'application',
            $applicationId,
        );
    }
}
