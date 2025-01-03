// lib/email-templates/admin-notification.tsx
import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Text,
} from '@react-email/components';

interface AdminNotificationEmailProps {
	userEmail: string;
	amount: number;
	credits: number;
	paymentId: string;
}

export default function AdminNotificationEmail({
	userEmail,
	amount,
	credits,
	paymentId,
}: AdminNotificationEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>New payment received</Preview>
			<Body>
				<Container>
					<Heading>New Payment Received</Heading>
					<Text>
						A new payment has been processed successfully.
					</Text>
					<Text>
						Details:
						<br />
						User: {userEmail}
						<br />
						Amount: €{amount}
						<br />
						Credits: {credits}
						<br />
						Payment ID: {paymentId}
					</Text>
				</Container>
			</Body>
		</Html>
	);
}
