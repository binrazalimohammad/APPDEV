<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use App\Entity\Application;
use App\Entity\Listing;
use App\Entity\Payment;
use App\Service\NotificationService;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\ORM\Events;

/**
 * Creates user notifications when an admin/staff updates record status.
 *
 * Adjust entity FQCNs and getter names if your websitedev project differs.
 */
#[AsDoctrineListener(event: Events::preUpdate)]
class StatusChangeNotificationSubscriber
{
    public function __construct(private NotificationService $notifications)
    {
    }

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $entity = $args->getObject();

        if ($entity instanceof Application) {
            $this->onApplicationUpdate($entity, $args);
            return;
        }

        if ($entity instanceof Payment) {
            $this->onPaymentUpdate($entity, $args);
            return;
        }

        if ($entity instanceof Listing) {
            $this->onListingUpdate($entity, $args);
        }
    }

    private function onApplicationUpdate(Application $application, PreUpdateEventArgs $args): void
    {
        if (!$args->hasChangedField('status')) {
            return;
        }

        $tenant = $application->getTenant();
        if (!$tenant) {
            return;
        }

        $listingName = $application->getListing()?->getName() ?? 'your selected unit';
        $old = (string) $args->getOldValue('status');
        $new = (string) $args->getNewValue('status');

        $this->notifications->notifyApplicationStatusChange(
            $tenant,
            $listingName,
            $old,
            $new,
            (int) $application->getId(),
        );

        if (in_array(strtolower($new), ['approved', 'contract_ready', 'ready_for_signature'], true)) {
            $this->notifications->notifyContractReady($tenant, $listingName, (int) $application->getId());
        }
    }

    private function onPaymentUpdate(Payment $payment, PreUpdateEventArgs $args): void
    {
        if (!$args->hasChangedField('status')) {
            return;
        }

        $tenant = $payment->getApplication()?->getTenant();
        if (!$tenant) {
            return;
        }

        $period = $payment->getNotes()
            ?? $payment->getCreatedAt()?->format('F Y')
            ?? 'your account';

        $this->notifications->notifyPaymentStatusChange(
            $tenant,
            $period,
            (string) $args->getNewValue('status'),
            (int) $payment->getId(),
        );
    }

    private function onListingUpdate(Listing $listing, PreUpdateEventArgs $args): void
    {
        if (!$args->hasChangedField('status')) {
            return;
        }

        $landlord = $listing->getLandlord();
        if (!$landlord) {
            return;
        }

        $address = $listing->getName() ?? $listing->getAddress() ?? 'your property';
        $this->notifications->notifyListingStatusChange(
            $landlord,
            $address,
            (string) $args->getNewValue('status'),
            (int) $listing->getId(),
        );
    }
}
