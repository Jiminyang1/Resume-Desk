import { IconButton } from "components/Button";
import { useTranslation } from "components/AppPreferencesProvider";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowSmallUpIcon,
  ArrowSmallDownIcon,
  TrashIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

export const ShowIconButton = ({
  show,
  setShow,
  size = "medium",
  targetLabel = "section",
}: {
  show: boolean;
  setShow: (show: boolean) => void;
  size?: "small" | "medium";
  targetLabel?: string;
}) => {
  const copy = useTranslation();
  const tooltipText = show
    ? targetLabel === "entry"
      ? copy.forms.hideEntry
      : copy.forms.hideSection
    : targetLabel === "entry"
      ? copy.forms.showEntry
      : copy.forms.showSection;
  const onClick = () => {
    setShow(!show);
  };
  const Icon = show ? EyeIcon : EyeSlashIcon;
  const sizeClassName = size === "medium" ? "h-6 w-6" : "h-4 w-4";

  return (
    <IconButton onClick={onClick} tooltipText={tooltipText} size={size}>
      <Icon className={`${sizeClassName} text-gray-400`} aria-hidden="true" />
      <span className="sr-only">{tooltipText}</span>
    </IconButton>
  );
};

type MoveIconButtonType = "up" | "down";
export const MoveIconButton = ({
  type,
  size = "medium",
  onClick,
}: {
  type: MoveIconButtonType;
  size?: "small" | "medium";
  onClick: (type: MoveIconButtonType) => void;
}) => {
  const copy = useTranslation();
  const tooltipText = type === "up" ? copy.forms.moveUp : copy.forms.moveDown;
  const sizeClassName = size === "medium" ? "h-6 w-6" : "h-4 w-4";
  const Icon = type === "up" ? ArrowSmallUpIcon : ArrowSmallDownIcon;

  return (
    <IconButton
      onClick={() => onClick(type)}
      tooltipText={tooltipText}
      size={size}
    >
      <Icon className={`${sizeClassName} text-gray-400`} aria-hidden="true" />
      <span className="sr-only">{tooltipText}</span>
    </IconButton>
  );
};

export const DeleteIconButton = ({
  onClick,
  tooltipText,
}: {
  onClick: () => void;
  tooltipText: string;
}) => {
  const copy = useTranslation();
  return (
    <IconButton
      onClick={onClick}
      tooltipText={tooltipText || copy.dashboard.deleteResume}
      size="small"
    >
      <TrashIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
      <span className="sr-only">{tooltipText || copy.dashboard.deleteResume}</span>
    </IconButton>
  );
};

export const BulletListIconButton = ({
  onClick,
  showBulletPoints,
}: {
  onClick: (newShowBulletPoints: boolean) => void;
  showBulletPoints: boolean;
}) => {
  const copy = useTranslation();
  const tooltipText = showBulletPoints
    ? copy.forms.hideBulletPoints
    : copy.forms.showBulletPoints;

  return (
    <IconButton
      onClick={() => onClick(!showBulletPoints)}
      tooltipText={tooltipText}
      size="small"
      className={showBulletPoints ? "!bg-sky-100" : ""}
    >
      <ListBulletIcon
        className={`h-4 w-4 ${
          showBulletPoints ? "text-gray-700" : "text-gray-400"
        }`}
        aria-hidden="true"
      />
      <span className="sr-only">{tooltipText}</span>
    </IconButton>
  );
};
