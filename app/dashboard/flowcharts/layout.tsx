export default function FlowchartsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen">
			{children}
		</div>
	);
}