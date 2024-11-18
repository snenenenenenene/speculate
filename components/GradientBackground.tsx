"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

export function GradientBackground() {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const handleMouseMove = useCallback(
		({ clientX, clientY }: MouseEvent) => {
			const windowWidth = window.innerWidth;
			const windowHeight = window.innerHeight;

			// Convert mouse position to percentage
			const x = clientX / windowWidth;
			const y = clientY / windowHeight;

			// Update motion values with slight delay for smooth effect
			mouseX.set(x);
			mouseY.set(y);
		},
		[mouseX, mouseY]
	);

	useEffect(() => {
		if (isClient) {
			window.addEventListener("mousemove", handleMouseMove);
			return () => {
				window.removeEventListener("mousemove", handleMouseMove);
			};
		}
	}, [isClient, handleMouseMove]);

	const background = useMotionTemplate`
    radial-gradient(
      650px circle at ${useMotionTemplate`${mouseX.get() * 100}% ${mouseY.get() * 100}%`},
      rgba(99, 102, 241, 0.15),
      rgba(140, 82, 254, 0.15),
      rgba(156, 57, 229, 0.15),
      transparent 80%
    ),
    radial-gradient(
      1250px circle at ${useMotionTemplate`${mouseX.get() * 100}% ${mouseY.get() * 100}%`},
      rgba(255, 255, 255, 0.1),
      rgba(140, 82, 254, 0.05),
      transparent 80%
    )
  `;

	return (
		<motion.div
			className="fixed inset-0 -z-10 h-full w-full bg-[#fdfaff] [perspective:1000px]"
			style={{
				background,
				transition: "background 0.5s ease",
			}}
		/>
	);
}