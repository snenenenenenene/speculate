// lib/email-templates/payment-success.tsx
import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Text,
} from '@react-email/components';

interface PaymentSuccessEmailProps {
	amount: number;
	credits: number;
	paymentId: string;
}

export default function PaymentSuccessEmail({
	amount,
	credits,
	paymentId,
}: PaymentSuccessEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Your payment was successful</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={h1}>Payment Successful!</Heading>
					<Text style={text}>
						Thank you for your purchase. Your payment of €{amount} has been processed successfully.
					</Text>
					<Text style={text}>
						You have received {credits} credits in your account. You can now use these credits
						to validate your green claims.
					</Text>
					<Text style={text}>
						Payment Reference: {paymentId}
					</Text>
					<Link
						href="https://your-domain.com/claims"
						style={button}
					>
						Start Validating Claims
					</Link>
					<Text style={footer}>
						If you have any questions, please don't hesitate to contact our support team.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

const main = {
	backgroundColor: '#f6f9fc',
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
	backgroundColor: '#ffffff',
	margin: '0 auto',
	padding: '40px 20px',
	borderRadius: '10px',
	maxWidth: '600px',
};

const h1 = {
	color: '#32a852',
	fontSize: '24px',
	fontWeight: '600',
	lineHeight: '32px',
	margin: '0 0 20px',
};

const text = {
	color: '#525f7f',
	fontSize: '16px',
	lineHeight: '24px',
	margin: '0 0 16px',
};

const button = {
	backgroundColor: '#32a852',
	borderRadius: '5px',
	color: '#ffffff',
	display: 'block',
	fontSize: '16px',
	fontWeight: '600',
	lineHeight: '100%',
	margin: '24px auto',
	maxWidth: '240px',
	padding: '16px 24px',
	textDecoration: 'none',
	textAlign: 'center' as const,
};

const footer = {
	color: '#8898aa',
	fontSize: '14px',
	lineHeight: '22px',
	margin: '24px 0 0',
};