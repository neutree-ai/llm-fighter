import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const DoubleCheckDeleteButton = ({
  onDelete,
  disabled = false,
  className,
}: {
  onDelete: () => Promise<unknown>;
  disabled?: boolean;
  className?: string;
}) => {
  const [checkLevel, setCheckLevel] = useState(0);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (checkLevel === 1) {
      setCheckLevel(0);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [checkLevel, countdown]);

  return (
    <Button
      variant="destructive"
      size="sm"
      className={className}
      onClick={(evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        if (checkLevel === 0) {
          setCheckLevel(1);
          setCountdown(3);
        }

        if (checkLevel === 1) {
          setCheckLevel(2);
          onDelete().finally(() => {
            setCheckLevel(0);
          });
        }
      }}
      disabled={disabled}
    >
      {checkLevel === 0 && "Delete"}
      {checkLevel === 1 && `Confirm in ${countdown}s`}
      {checkLevel === 2 && "Deleting..."}
    </Button>
  );
};

export default DoubleCheckDeleteButton;
