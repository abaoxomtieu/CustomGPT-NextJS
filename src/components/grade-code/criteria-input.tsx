import { Minus, Plus, Maximize2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

interface CriteriaInputProps {
  criterias: string[];
  setCriterias: React.Dispatch<React.SetStateAction<string[]>>;
  folderCriteria: string;
  setFolderCriteria: React.Dispatch<React.SetStateAction<string>>;
}

const CriteriaInput: React.FC<CriteriaInputProps> = ({
  criterias,
  setCriterias,
  folderCriteria,
  setFolderCriteria,
}) => {
  const t = useTranslations("codeGrader.criteriaInput");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<"folder" | "criteria">(
    "criteria"
  );
  const [tempValue, setTempValue] = useState("");

  const addCriteriaField = useCallback(() => {
    setCriterias((prev) => [...prev, ""]);
  }, [setCriterias]);

  const removeCriteriaField = useCallback(
    (index: number) => {
      setCriterias((prev) => {
        const newCriterias = [...prev];
        newCriterias.splice(index, 1);
        return newCriterias;
      });
    },
    [setCriterias]
  );

  const handleCriteriaChange = useCallback(
    (value: string, index: number) => {
      setCriterias((prev) => {
        const newCriterias = [...prev];
        newCriterias[index] = value;
        return newCriterias;
      });
    },
    [setCriterias]
  );

  const openDialog = (type: "folder" | "criteria", index?: number) => {
    setEditingType(type);
    if (type === "folder") {
      setTempValue(folderCriteria);
      setEditingIndex(null);
    } else if (index !== undefined) {
      setTempValue(criterias[index]);
      setEditingIndex(index);
    }
    setIsDialogOpen(true);
  };

  const saveDialogChanges = () => {
    if (editingType === "folder") {
      setFolderCriteria(tempValue);
    } else if (editingIndex !== null) {
      handleCriteriaChange(tempValue, editingIndex);
    }
    setIsDialogOpen(false);
    setTempValue("");
    setEditingIndex(null);
  };

  const cancelDialog = () => {
    setIsDialogOpen(false);
    setTempValue("");
    setEditingIndex(null);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <>
      <div className="border rounded p-3 bg-background space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">
            {t("folderStructureTitle")}
          </label>
          <div className="flex items-center gap-2 bg-background">
            <Textarea
              value={folderCriteria}
              onChange={(e) => setFolderCriteria(e.target.value)}
              placeholder={t("folderStructurePlaceholder")}
              className="flex-1 text-sm resize-none h-3 md:h-8 bg-background"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDialog("folder")}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            {t("otherTitle")}
          </label>
          <div className="space-y-2">
            {criterias.map((criteria, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-background"
              >
                <Textarea
                  value={criteria}
                  onChange={(e) => handleCriteriaChange(e.target.value, index)}
                  placeholder={t("otherPlaceholder", { index: index + 1 })}
                  className="flex-1 text-sm resize-none h-3 md:h-8 bg-background"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDialog("criteria", index)}
                  className="h-8 w-8 p-0"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
                {criterias.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCriteriaField(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                )}
                {index === criterias.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCriteriaField}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingType === "folder"
                ? t("dialogTitleFolder")
                : t("dialogTitleOther", {
                    index: editingIndex !== null ? editingIndex + 1 : "",
                  })}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={
                editingType === "folder"
                  ? t("dialogPlaceholderFolder")
                  : t("dialogPlaceholderOther")
              }
              rows={12}
              className="min-h-[300px] text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDialog}>
              {t("cancel")}
            </Button>
            <Button onClick={saveDialogChanges}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CriteriaInput;
