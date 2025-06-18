import { Minus, Plus, Maximize2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<"folder" | "criteria">("criteria");
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
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <>
      <div className="border rounded p-3 bg-gray-50 space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">
            Folder Structure Criteria:
          </label>
          <div className="flex items-center gap-2">
            <Textarea
              value={folderCriteria}
              onChange={(e) => setFolderCriteria(e.target.value)}
              placeholder="Enter folder criteria"
              className="flex-1 text-sm resize-none h-3 md:h-8"
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
            Other Criteria:
          </label>
          <div className="space-y-2">
            {criterias.map((criteria, index) => (
              <div key={index} className="flex items-center gap-2">
                <Textarea
                  value={criteria}
                  onChange={(e) => handleCriteriaChange(e.target.value, index)}
                  placeholder={`Enter criteria ${index + 1}`}
                  className="flex-1 text-sm resize-none h-3 md:h-8"
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
              Edit {editingType === "folder" ? "Folder Structure" : "Other"} Criteria
              {editingType === "criteria" && editingIndex !== null && ` #${editingIndex + 1}`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={`Enter ${editingType === "folder" ? "folder structure" : "other"} criteria`}
              rows={12}
              className="min-h-[300px] text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDialog}>
              Cancel
            </Button>
            <Button onClick={saveDialogChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CriteriaInput;
