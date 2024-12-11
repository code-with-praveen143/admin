"use client";
import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Interfaces (you may want to move these to a separate types file)
interface Regulation {
  type: string;
  regulation: string;
  validYears: number[];
}

interface Program {
  name: string;
  specializations: string[];
  years: number[];
  regulations: Regulation[];
}

interface CollegeDetails {
  address: string;
  contactNumber: string;
  email: string;
}

interface CollegeData {
  _id?: string;
  collegeName: string;
  regulatoryBody: string;
  domain: string;
  details: CollegeDetails;
  programs: Program[];
}

// Predefined options
const programOptions = [
  {
    name: "B.Tech",
    specializations: ["CSE", "ECE", "EEE", "CSM", "Civil", "Mechanical"],
    years: [1, 2, 3, 4],
    regulations: [
      {
        type: "JNTU",
        regulation: "",
        validYears: [2020, 2021, 2022, 2023],
      },
      {
        type: "Autonomous",
        regulation: "",
        validYears: [2021, 2022, 2023, 2024],
      },
    ],
  },
  {
    name: "M.Tech",
    specializations: ["CSE", "VLSI", "Power Systems"],
    years: [1, 2],
    regulations: [
      {
        type: "JNTU",
        regulation: "N/A",
        validYears: [2019, 2020],
      },
    ],
  },
];

interface CollegeDataFormProps {
  onSubmit: (data: CollegeData) => void;
  initialData?: CollegeData;
  isEditMode?: boolean;
  regulationsData?: any;
}

export default function CollegeDataForm({
  onSubmit,
  initialData,
  isEditMode = false,
  regulationsData,
}: CollegeDataFormProps) {
  // State management
  const [newData, setNewData] = useState<CollegeData>(
    initialData || {
      collegeName: "",
      regulatoryBody: "",
      domain: "",
      details: { address: "", contactNumber: "", email: "" },
      programs: [],
    }
  );
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSpecializations, setSelectedSpecializations] = useState<
    string[]
  >([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedRegulations, setSelectedRegulations] = useState<Regulation[]>(
    []
  );
  const [newSpecialization, setNewSpecialization] = useState("");
  const [customSpecializations, setCustomSpecializations] = useState<string[]>(
    []
  );
  const [showOtherSpecialization, setShowOtherSpecialization] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showJNTUDropdown, setShowJNTUDropdown] = useState(false);

  // Group regulations by category
  const groupedRegulations = regulationsData?.reduce(
    (acc: any, regulation: any) => {
      const category = regulation.regulation_category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(regulation);
      return acc;
    },
    {}
  );

  // Utility functions
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedRegulations([]); // Reset selected regulation types when category changes
  };

  const handleRegulationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const regulationType = e.target.value;
    setSelectedRegulations((prev) =>
      e.target.checked
        ? [
            ...prev,
            {
              type: selectedCategory,
              regulation: regulationType,
              validYears: [],
            },
          ]
        : prev.filter((item) => item.regulation !== regulationType)
    );
  };

  const handleAddSpecialization = () => {
    if (
      newSpecialization &&
      !customSpecializations.includes(newSpecialization)
    ) {
      setCustomSpecializations([...customSpecializations, newSpecialization]);
      setSelectedSpecializations([
        ...selectedSpecializations,
        newSpecialization,
      ]);
      setNewSpecialization("");
    }
  };

  const handleRemoveSpecialization = (spec: string) => {
    setCustomSpecializations(customSpecializations.filter((s) => s !== spec));
    setSelectedSpecializations(
      selectedSpecializations.filter((s) => s !== spec)
    );
  };

  const getAllSpecializations = () => {
    const defaultSpecs =
      programOptions.find((p) => p.name === selectedProgram)?.specializations ||
      [];
    return [...defaultSpecs, "Other"];
  };

  const getAllRegulations = () => {
    const program = programOptions.find(
      (program) => program.name === selectedProgram
    );
    return program ? program.regulations : [];
  };

  const handleAddOrUpdate = () => {
    const updatedPrograms: Program[] = [
      {
        name: selectedProgram,
        specializations: selectedSpecializations,
        years: selectedYears,
        regulations: selectedRegulations,
      },
    ];

    const collegeDataToSave = {
      ...newData,
      programs: updatedPrograms,
    };

    onSubmit(collegeDataToSave);
    setDialogOpen(false);
  };

  const handleDialogOpen = () => {
    // Reset form state
    setNewData({
      collegeName: "",
      regulatoryBody: "",
      domain: "",
      details: { address: "", contactNumber: "", email: "" },
      programs: [],
    });
    setSelectedProgram("");
    setSelectedSpecializations([]);
    setSelectedYears([]);
    setSelectedRegulations([]);
    setCustomSpecializations([]);
    setDialogOpen(true);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto" onClick={handleDialogOpen}>
          <Plus className="mr-2 h-4 w-4" /> Add New Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? "Edit College Data" : "Add New College Data"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collegeName">College Name</Label>
                  <Input
                    id="collegeName"
                    value={newData.collegeName}
                    onChange={(e) =>
                      setNewData({
                        ...newData,
                        collegeName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regulatoryBody">Regulatory Body</Label>
                  <Input
                    id="regulatoryBody"
                    value={newData.regulatoryBody}
                    onChange={(e) =>
                      setNewData({
                        ...newData,
                        regulatoryBody: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={newData.domain}
                    onChange={(e) =>
                      setNewData({
                        ...newData,
                        domain: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newData.details.address}
                    onChange={(e) =>
                      setNewData({
                        ...newData,
                        details: {
                          ...newData.details,
                          address: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={newData.details.contactNumber}
                    onChange={(e) =>
                      setNewData({
                        ...newData,
                        details: {
                          ...newData.details,
                          contactNumber: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={newData.details.email}
                    onChange={(e) =>
                      setNewData({
                        ...newData,
                        details: {
                          ...newData.details,
                          email: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Program Selection */}
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Program Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  <select
                    title="Program"
                    id="program"
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background text-foreground"
                  >
                    <option value="">Select Program</option>
                    {programOptions?.map((program) => (
                      <option key={program.name} value={program.name}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProgram && (
                  <div className="space-y-6">
                    {/* Specializations Section */}
                    <div className="space-y-2">
                      <Label>Specializations</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {getAllSpecializations()?.map((spec) => (
                          <label
                            key={spec}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              value={spec}
                              checked={
                                spec === "Other"
                                  ? showOtherSpecialization
                                  : selectedSpecializations.includes(spec)
                              }
                              onChange={(e) => {
                                if (spec === "Other") {
                                  setShowOtherSpecialization(e.target.checked);
                                } else if (e.target.checked) {
                                  setSelectedSpecializations([
                                    ...selectedSpecializations,
                                    spec,
                                  ]);
                                } else {
                                  setSelectedSpecializations(
                                    selectedSpecializations.filter(
                                      (s) => s !== spec
                                    )
                                  );
                                }
                              }}
                              className="rounded border-input"
                            />
                            <span>{spec}</span>
                          </label>
                        ))}
                      </div>

                      {showOtherSpecialization && (
                        <div className="mt-4 space-y-2">
                          <div className="flex gap-2 mb-2">
                            <Input
                              placeholder="Add new specialization"
                              value={newSpecialization}
                              onChange={(e) =>
                                setNewSpecialization(e.target.value)
                              }
                              className="flex-1"
                            />
                            <Button onClick={handleAddSpecialization}>
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {customSpecializations?.map((spec) => (
                              <Badge
                                key={spec}
                                variant="secondary"
                                className="px-2 py-1"
                              >
                                {spec}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 ml-1"
                                  onClick={() =>
                                    handleRemoveSpecialization(spec)
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Regulations Section */}
                    <div className="space-y-2">
                      <Label>Regulations</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {getAllRegulations()?.map((reg) => (
                          <label
                            key={reg.type}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              value={reg.type}
                              checked={selectedRegulations.some(
                                (r) => r.type === reg.type
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRegulations([
                                    ...selectedRegulations,
                                    reg,
                                  ]);
                                  if (reg.type === "JNTU") {
                                    setShowJNTUDropdown(true);
                                  }
                                } else {
                                  setSelectedRegulations(
                                    selectedRegulations.filter(
                                      (r) => r.type !== reg.type
                                    )
                                  );
                                  if (reg.type === "JNTU") {
                                    setShowJNTUDropdown(false);
                                  }
                                }
                              }}
                              className="rounded border-input"
                            />
                            <span>{reg.type}</span>
                          </label>
                        ))}
                      </div>

                      {/* JNTU Regulations Dropdown */}
                      {showJNTUDropdown && (
                        <div className="mt-4 space-y-2">
                          <Label htmlFor="jntuRegulation">
                            JNTU Regulation
                          </Label>
                          <select
                            title="JNTU Regulation"
                            id="jntuRegulation"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className="w-full p-2 border rounded-md bg-background text-foreground"
                          >
                            <option value="">Select Category</option>
                            {groupedRegulations &&
                              Object.keys(groupedRegulations)?.map(
                                (category) => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                )
                              )}
                          </select>
                        </div>
                      )}

                      {/* Show checkboxes for regulation types */}
                      {selectedCategory &&
                        groupedRegulations[selectedCategory] && (
                          <div className="mt-4 space-y-2">
                            <Label>Regulation Types</Label>
                            {groupedRegulations[selectedCategory]?.map(
                              (regulation: any) => (
                                <div key={regulation._id}>
                                  <input
                                    type="checkbox"
                                    id={regulation._id}
                                    value={regulation.regulation_type}
                                    checked={selectedRegulations.some(
                                      (r) =>
                                        r.regulation ===
                                        regulation.regulation_type
                                    )}
                                    onChange={handleRegulationChange}
                                  />
                                  <label
                                    htmlFor={regulation._id}
                                    className="ml-2"
                                  >
                                    {regulation.regulation_type} (Year:{" "}
                                    {regulation.year_validation})
                                  </label>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>

                    {/* Years Section */}
                    <div className="space-y-2">
                      <Label>Years</Label>
                      <div className="flex flex-wrap gap-2">
                        {programOptions
                          .find((program) => program.name === selectedProgram)
                          ?.years?.map((year) => (
                            <label
                              key={year}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                value={year}
                                checked={selectedYears.includes(year)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedYears([...selectedYears, year]);
                                  } else {
                                    setSelectedYears(
                                      selectedYears.filter((y) => y !== year)
                                    );
                                  }
                                }}
                                className="rounded border-input"
                              />
                              <span>Year {year}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddOrUpdate}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
