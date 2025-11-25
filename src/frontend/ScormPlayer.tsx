import { useEffect, useRef, useState } from "react";
import { SCORMState } from "../types/scorm";

interface ScormPlayerProps {
	launchUrl: string;
	userId?: string;
	courseId?: string;
	lessonId?: string;
	saveProgress: (data: SCORMState) => void;
}

export function ScormPlayer({
	launchUrl,
	userId,
	courseId,
	lessonId,
	saveProgress,
}: ScormPlayerProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [scormState, setScormState] = useState<SCORMState>({});

	useEffect(() => {
		(window as any).API_1484_11 = {
			Initialize: () => "true",
			Terminate: () => "true",
			GetValue: (key: string) =>
				scormState[key as keyof SCORMState] || "",
			SetValue: (key: string, value: any) => {
				const updatedState = { ...scormState, [key]: value };
				setScormState(updatedState);
				saveProgress(updatedState);
				return "true";
			},
			Commit: () => {
				saveProgress(scormState);
				return "true";
			},
			GetLastError: () => 0,
			GetErrorString: () => "",
			GetDiagnostic: () => "",
		};
	}, [scormState, saveProgress]);

	return (
		<iframe ref={iframeRef} src={launchUrl} width='100%' height='600px' />
	);
}
