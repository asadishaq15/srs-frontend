"use client"

import type { ChangeEvent } from "react"
import { Camera, Upload, User, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface StudentFormProps {
  formData: {
    studentId: string
    firstName: string
    lastName: string
    class: string
    section: string
    gender: string
    dob: string
    email: string
    phone: string
    address: string
    enrollDate: string
    expectedGraduation: string
    transcripts: File[]
    iipFlag: boolean // Changed to boolean
    honorRolls: boolean
    athletics: boolean
    clubs: string
    lunch: string
    nationality: string
    emergencyContact: string
    [key: string]: any
  }
  errors: {
    studentId: string
    firstName: string
    lastName: string
    class: string
    section: string
    gender: string
    dob: string
    email: string
    phone: string
    address: string
    expectedGraduation: string
    iipFlag: string
    clubs: string
    lunch: string
    nationality: string
    emergencyContact: string
    [key: string]: any
  }
  photoPreview: string | null
  transcriptPreviews?: { name: string; size: number }[]
  onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSelectChange: (name: string, value: string | boolean) => void
  onPhotoChange: (e: ChangeEvent<HTMLInputElement>) => void
  onTranscriptChange?: (e: ChangeEvent<HTMLInputElement>) => void
  onRemoveTranscript?: (index: number) => void
  onContinue: () => void
  onCancel: () => void
  disabled?: boolean
  isEditing?: boolean
}

export function StudentForm({
  formData,
  errors,
  photoPreview,
  transcriptPreviews = [],
  onInputChange,
  onSelectChange,
  onPhotoChange,
  onTranscriptChange,
  onRemoveTranscript,
  onContinue,
  onCancel,
  disabled = false,
  isEditing = false,
}: StudentFormProps) {
  return (
    <div className="p-6 space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Student Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full bg-gray-100 overflow-hidden">
                  {photoPreview ? (
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Student preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
                  )}
                </div>
                <label
                  htmlFor="student-photo-upload"
                  className={`absolute bottom-0 right-0 rounded-full bg-black p-2 text-white shadow-lg ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    id="student-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onPhotoChange}
                    disabled={disabled}
                  />
                </label>
              </div>
              <label htmlFor="student-photo-upload-btn" className="mt-4">
                <Button variant="outline" asChild disabled={disabled}>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                    <input
                      id="student-photo-upload-btn"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onPhotoChange}
                      disabled={disabled}
                    />
                  </span>
                </Button>
              </label>
            </div>

            {/* Transcripts Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Transcripts</h3>
                <label htmlFor="transcript-upload" className="inline-flex">
                  <Button variant="outline" size="sm" asChild disabled={disabled}>
                    <span>
                      <FileText className="mr-1 h-3 w-3" />
                      Add Files
                      <input
                        id="transcript-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={onTranscriptChange}
                        disabled={disabled}
                      />
                    </span>
                  </Button>
                </label>
              </div>

              {transcriptPreviews.length > 0 ? (
                <div className="max-h-[300px] h-auto w-full overflow-x-auto rounded-md border p-2">
                  <div className="space-y-2">
                    {transcriptPreviews.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center w-full overflow-x-auto bg-gray-50 justify-between rounded-md p-2 text-sm"
                      >
                        <div className="flex items-center space-x-2 w-full truncate">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onRemoveTranscript && onRemoveTranscript(index)}
                          disabled={disabled}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-[120px] w-full items-center justify-center rounded-md border border-dashed">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div className="text-xs text-gray-500">No transcripts uploaded</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Enter first name"
                  className={`border-gray-200 ${errors.firstName ? "border-red-500" : ""}`}
                  value={formData.firstName}
                  onChange={onInputChange}
                  disabled={disabled}
                />
                {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Enter last name"
                  className={`border-gray-200 ${errors.lastName ? "border-red-500" : ""}`}
                  value={formData.lastName}
                  onChange={onInputChange}
                  disabled={disabled}
                />
                {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup
                value={formData.gender}
                className="flex space-x-4"
                onValueChange={(value) => onSelectChange("gender", value)}
                disabled={disabled}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  className={`border-gray-200 ${errors.dob ? "border-red-500" : ""}`}
                  value={formData.dob}
                  onChange={onInputChange}
                  disabled={disabled}
                />
                {errors.dob && <p className="text-sm text-red-500 mt-1">{errors.dob}</p>}
              </div>
              <div className={`space-y-2 ${isEditing === false ? 'hidden' : ""}`}>
                <Label htmlFor="studentId">Student Id </Label>
                <Input
                  id="studentId"
                  name="studentId"
                  placeholder="Enter Student ID"
                  className={`border-gray-200 ${errors.studentId ? "border-red-500" : ""} ${isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  value={formData.studentId}
                  onChange={onInputChange}
                  disabled={disabled || isEditing}
                />
                {errors.studentId && <p className="text-sm text-red-500 mt-1">{errors.studentId}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Grade Level </Label>
                <Input
                  id="class"
                  name="class"
                  placeholder="Enter Grade Level"
                  className={`border-gray-200 ${errors.class ? "border-red-500" : ""}`}
                  value={formData.class}
                  onChange={onInputChange}
                  disabled={disabled}
                />
                {errors.class && <p className="text-sm text-red-500 mt-1">{errors.class}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact </Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  placeholder="Emergency Contact"
                  className={`border-gray-200 ${errors.class ? "border-red-500" : ""}`}
                  value={formData.emergencyContact}
                  onChange={onInputChange}
                  disabled={disabled}
                />
                {errors.emergencyContact && <p className="text-sm text-red-500 mt-1">{errors.emergencyContact}</p>}
              </div>

            </div>


            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) => onSelectChange("section", value)}
                  disabled={disabled}
                >
                  <SelectTrigger id="section" className={errors.section ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
                {errors.section && <p className="text-sm text-red-500 mt-1">{errors.section}</p>}
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="enrollDate">Enrollment Date</Label>
                <Input
                  id="enrollDate"
                  name="enrollDate"
                  type="date"
                  className="border-gray-200"
                  value={formData.enrollDate}
                  onChange={onInputChange}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedGraduation">Expected Graduation Year</Label>
                <Select
                  value={formData.expectedGraduation}
                  onValueChange={(value) => onSelectChange("expectedGraduation", value)}
                  disabled={disabled}
                >
                  <SelectTrigger id="expectedGraduation" className={errors.expectedGraduation ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 16 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.expectedGraduation && <p className="text-sm text-red-500 mt-1">{errors.expectedGraduation}</p>}
              </div> */}

<div className="space-y-2">
  <Label htmlFor="enrollDate">Enrollment Date</Label>
  <Input
    id="enrollDate"
    name="enrollDate"
    type="date"
    className={`border-gray-200 ${isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
    value={formData.enrollDate}
    onChange={onInputChange}
    disabled={disabled || isEditing} // Add isEditing to disabled condition
  />
</div>

<div className="space-y-2">
  <Label htmlFor="expectedGraduation">Expected Graduation Year</Label>
  <Input
    id="expectedGraduation"
    name="expectedGraduation"
    type="text"
    className="border-gray-200 bg-gray-100 cursor-not-allowed"
    value={
      formData.enrollDate
        ? new Date(new Date(formData.enrollDate).setFullYear(
            new Date(formData.enrollDate).getFullYear() + 5
          )).getFullYear()
        : ''
    }
    readOnly
    disabled
  />
</div>

            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  className={`border-gray-200 ${errors.email ? "border-red-500" : ""} ${isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  value={formData.email}
                  onChange={onInputChange}
                  disabled={disabled || isEditing}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  className={`border-gray-200 ${errors.phone ? "border-red-500" : ""}`}
                  value={formData.phone}
                  onChange={onInputChange}
                  disabled={disabled}
                />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Enter address"
                className={`border-gray-200 min-h-[80px] ${errors.address ? "border-red-500" : ""}`}
                value={formData.address}
                onChange={onInputChange}
                disabled={disabled}
              />
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
            </div>

            {/* Add these new fields after the address field and before the Separator */}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="iipFlag" className="cursor-pointer">
                    IIP Flag
                  </Label>
                  <Switch
                    id="iipFlag"
                    checked={formData.iipFlag}
                    onCheckedChange={(checked) => onSelectChange("iipFlag", checked)}
                    disabled={disabled}
                  />
                </div>
                {errors.iipFlag && <p className="text-sm text-red-500 mt-1">{errors.iipFlag}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Select
                  value={formData.nationality}
                  onValueChange={(value) => onSelectChange("nationality", value)}
                  disabled={disabled}
                >
                  <SelectTrigger id="nationality" className={errors.nationality ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="Afghanistan">🇦🇫 Afghanistan</SelectItem>
<SelectItem value="Albania">🇦🇱 Albania</SelectItem>
<SelectItem value="Algeria">🇩🇿 Algeria</SelectItem>
<SelectItem value="Andorra">🇦🇩 Andorra</SelectItem>
<SelectItem value="Angola">🇦🇴 Angola</SelectItem>
<SelectItem value="Antigua and Barbuda">🇦🇬 Antigua and Barbuda</SelectItem>
<SelectItem value="Argentina">🇦🇷 Argentina</SelectItem>
<SelectItem value="Armenia">🇦🇲 Armenia</SelectItem>
<SelectItem value="Australia">🇦🇺 Australia</SelectItem>
<SelectItem value="Austria">🇦🇹 Austria</SelectItem>
<SelectItem value="Azerbaijan">🇦🇿 Azerbaijan</SelectItem>
<SelectItem value="Bahamas">🇧🇸 Bahamas</SelectItem>
<SelectItem value="Bahrain">🇧🇭 Bahrain</SelectItem>
<SelectItem value="Bangladesh">🇧🇩 Bangladesh</SelectItem>
<SelectItem value="Barbados">🇧🇧 Barbados</SelectItem>
<SelectItem value="Belarus">🇧🇾 Belarus</SelectItem>
<SelectItem value="Belgium">🇧🇪 Belgium</SelectItem>
<SelectItem value="Belize">🇧🇿 Belize</SelectItem>
<SelectItem value="Benin">🇧🇯 Benin</SelectItem>
<SelectItem value="Bhutan">🇧🇹 Bhutan</SelectItem>
<SelectItem value="Bolivia">🇧🇴 Bolivia</SelectItem>
<SelectItem value="Bosnia and Herzegovina">🇧🇦 Bosnia and Herzegovina</SelectItem>
<SelectItem value="Botswana">🇧🇼 Botswana</SelectItem>
<SelectItem value="Brazil">🇧🇷 Brazil</SelectItem>
<SelectItem value="Brunei">🇧🇳 Brunei</SelectItem>
<SelectItem value="Bulgaria">🇧🇬 Bulgaria</SelectItem>
<SelectItem value="Burkina Faso">🇧🇫 Burkina Faso</SelectItem>
<SelectItem value="Burundi">🇧🇮 Burundi</SelectItem>
<SelectItem value="Cabo Verde">🇨🇻 Cabo Verde</SelectItem>
<SelectItem value="Cambodia">🇰🇭 Cambodia</SelectItem>
<SelectItem value="Cameroon">🇨🇲 Cameroon</SelectItem>
<SelectItem value="Canada">🇨🇦 Canada</SelectItem>
<SelectItem value="Central African Republic">🇨🇫 Central African Republic</SelectItem>
<SelectItem value="Chad">🇹🇩 Chad</SelectItem>
<SelectItem value="Chile">🇨🇱 Chile</SelectItem>
<SelectItem value="China">🇨🇳 China</SelectItem>
<SelectItem value="Colombia">🇨🇴 Colombia</SelectItem>
<SelectItem value="Comoros">🇰🇲 Comoros</SelectItem>
<SelectItem value="Congo">🇨🇬 Congo</SelectItem>
<SelectItem value="Congo (Democratic Republic)">🇨🇩 Congo (Democratic Republic)</SelectItem>
<SelectItem value="Costa Rica">🇨🇷 Costa Rica</SelectItem>
<SelectItem value="Côte d'Ivoire">🇨🇮 Côte d'Ivoire</SelectItem>
<SelectItem value="Croatia">🇭🇷 Croatia</SelectItem>
<SelectItem value="Cuba">🇨🇺 Cuba</SelectItem>
<SelectItem value="Cyprus">🇨🇾 Cyprus</SelectItem>
<SelectItem value="Czech Republic">🇨🇿 Czech Republic</SelectItem>
<SelectItem value="Denmark">🇩🇰 Denmark</SelectItem>
<SelectItem value="Djibouti">🇩🇯 Djibouti</SelectItem>
<SelectItem value="Dominica">🇩🇲 Dominica</SelectItem>
<SelectItem value="Dominican Republic">🇩🇴 Dominican Republic</SelectItem>
<SelectItem value="Ecuador">🇪🇨 Ecuador</SelectItem>
<SelectItem value="Egypt">🇪🇬 Egypt</SelectItem>
<SelectItem value="El Salvador">🇸🇻 El Salvador</SelectItem>
<SelectItem value="Equatorial Guinea">🇬🇶 Equatorial Guinea</SelectItem>
<SelectItem value="Eritrea">🇪🇷 Eritrea</SelectItem>
<SelectItem value="Estonia">🇪🇪 Estonia</SelectItem>
<SelectItem value="Eswatini">🇸🇿 Eswatini</SelectItem>
<SelectItem value="Ethiopia">🇪🇹 Ethiopia</SelectItem>
<SelectItem value="Fiji">🇫🇯 Fiji</SelectItem>
<SelectItem value="Finland">🇫🇮 Finland</SelectItem>
<SelectItem value="France">🇫🇷 France</SelectItem>
<SelectItem value="Gabon">🇬🇦 Gabon</SelectItem>
<SelectItem value="Gambia">🇬🇲 Gambia</SelectItem>
<SelectItem value="Georgia">🇬🇪 Georgia</SelectItem>
<SelectItem value="Germany">🇩🇪 Germany</SelectItem>
<SelectItem value="Ghana">🇬🇭 Ghana</SelectItem>
<SelectItem value="Greece">🇬🇷 Greece</SelectItem>
<SelectItem value="Grenada">🇬🇩 Grenada</SelectItem>
<SelectItem value="Guatemala">🇬🇹 Guatemala</SelectItem>
<SelectItem value="Guinea">🇬🇳 Guinea</SelectItem>
<SelectItem value="Guinea-Bissau">🇬🇼 Guinea-Bissau</SelectItem>
<SelectItem value="Guyana">🇬🇾 Guyana</SelectItem>
<SelectItem value="Haiti">🇭🇹 Haiti</SelectItem>
<SelectItem value="Honduras">🇭🇳 Honduras</SelectItem>
<SelectItem value="Hungary">🇭🇺 Hungary</SelectItem>
<SelectItem value="Iceland">🇮🇸 Iceland</SelectItem>
<SelectItem value="India">🇮🇳 India</SelectItem>
<SelectItem value="Indonesia">🇮🇩 Indonesia</SelectItem>
<SelectItem value="Iran">🇮🇷 Iran</SelectItem>
<SelectItem value="Iraq">🇮🇶 Iraq</SelectItem>
<SelectItem value="Ireland">🇮🇪 Ireland</SelectItem>
<SelectItem value="Israel">🇮🇱 Israel</SelectItem>
<SelectItem value="Italy">🇮🇹 Italy</SelectItem>
<SelectItem value="Jamaica">🇯🇲 Jamaica</SelectItem>
<SelectItem value="Japan">🇯🇵 Japan</SelectItem>
<SelectItem value="Jordan">🇯🇴 Jordan</SelectItem>
<SelectItem value="Kazakhstan">🇰🇿 Kazakhstan</SelectItem>
<SelectItem value="Kenya">🇰🇪 Kenya</SelectItem>
<SelectItem value="Kiribati">🇰🇮 Kiribati</SelectItem>
<SelectItem value="North Korea">🇰🇵 North Korea</SelectItem>
<SelectItem value="South Korea">🇰🇷 South Korea</SelectItem>
<SelectItem value="Kuwait">🇰🇼 Kuwait</SelectItem>
<SelectItem value="Kyrgyzstan">🇰🇬 Kyrgyzstan</SelectItem>
<SelectItem value="Laos">🇱🇦 Laos</SelectItem>
<SelectItem value="Latvia">🇱🇻 Latvia</SelectItem>
<SelectItem value="Lebanon">🇱🇧 Lebanon</SelectItem>
<SelectItem value="Lesotho">🇱🇸 Lesotho</SelectItem>
<SelectItem value="Liberia">🇱🇷 Liberia</SelectItem>
<SelectItem value="Libya">🇱🇾 Libya</SelectItem>
<SelectItem value="Liechtenstein">🇱🇮 Liechtenstein</SelectItem>
<SelectItem value="Lithuania">🇱🇹 Lithuania</SelectItem>
<SelectItem value="Luxembourg">🇱🇺 Luxembourg</SelectItem>
<SelectItem value="Madagascar">🇲🇬 Madagascar</SelectItem>
<SelectItem value="Malawi">🇲🇼 Malawi</SelectItem>
<SelectItem value="Malaysia">🇲🇾 Malaysia</SelectItem>
<SelectItem value="Maldives">🇲🇻 Maldives</SelectItem>
<SelectItem value="Mali">🇲🇱 Mali</SelectItem>
<SelectItem value="Malta">🇲🇹 Malta</SelectItem>
<SelectItem value="Marshall Islands">🇲🇭 Marshall Islands</SelectItem>
<SelectItem value="Mauritania">🇲🇷 Mauritania</SelectItem>
<SelectItem value="Mauritius">🇲🇺 Mauritius</SelectItem>
<SelectItem value="Mexico">🇲🇽 Mexico</SelectItem>
<SelectItem value="Micronesia">🇫🇲 Micronesia</SelectItem>
<SelectItem value="Moldova">🇲🇩 Moldova</SelectItem>
<SelectItem value="Monaco">🇲🇨 Monaco</SelectItem>
<SelectItem value="Mongolia">🇲🇳 Mongolia</SelectItem>
<SelectItem value="Montenegro">🇲🇪 Montenegro</SelectItem>
<SelectItem value="Morocco">🇲🇦 Morocco</SelectItem>
<SelectItem value="Mozambique">🇲🇿 Mozambique</SelectItem>
<SelectItem value="Myanmar">🇲🇲 Myanmar</SelectItem>
<SelectItem value="Namibia">🇳🇦 Namibia</SelectItem>
<SelectItem value="Nauru">🇳🇷 Nauru</SelectItem>
<SelectItem value="Nepal">🇳🇵 Nepal</SelectItem>
<SelectItem value="Netherlands">🇳🇱 Netherlands</SelectItem>
<SelectItem value="New Zealand">🇳🇿 New Zealand</SelectItem>
<SelectItem value="Nicaragua">🇳🇮 Nicaragua</SelectItem>
<SelectItem value="Niger">🇳🇪 Niger</SelectItem>
<SelectItem value="Nigeria">🇳🇬 Nigeria</SelectItem>
<SelectItem value="North Macedonia">🇲🇰 North Macedonia</SelectItem>
<SelectItem value="Norway">🇳🇴 Norway</SelectItem>
<SelectItem value="Oman">🇴🇲 Oman</SelectItem>
<SelectItem value="Pakistan">🇵🇰 Pakistan</SelectItem>
<SelectItem value="Palau">🇵🇼 Palau</SelectItem>
<SelectItem value="Panama">🇵🇦 Panama</SelectItem>
<SelectItem value="Papua New Guinea">🇵🇬 Papua New Guinea</SelectItem>
<SelectItem value="Paraguay">🇵🇾 Paraguay</SelectItem>
<SelectItem value="Peru">🇵🇪 Peru</SelectItem>
<SelectItem value="Philippines">🇵🇭 Philippines</SelectItem>
<SelectItem value="Poland">🇵🇱 Poland</SelectItem>
<SelectItem value="Portugal">🇵🇹 Portugal</SelectItem>
<SelectItem value="Qatar">🇶🇦 Qatar</SelectItem>
<SelectItem value="Romania">🇷🇴 Romania</SelectItem>
<SelectItem value="Russia">🇷🇺 Russia</SelectItem>
<SelectItem value="Rwanda">🇷🇼 Rwanda</SelectItem>
<SelectItem value="Saint Kitts and Nevis">🇰🇳 Saint Kitts and Nevis</SelectItem>
<SelectItem value="Saint Lucia">🇱🇨 Saint Lucia</SelectItem>
<SelectItem value="Saint Vincent and the Grenadines">🇻🇨 Saint Vincent and the Grenadines</SelectItem>
<SelectItem value="Samoa">🇼🇸 Samoa</SelectItem>
<SelectItem value="San Marino">🇸🇲 San Marino</SelectItem>
<SelectItem value="Sao Tome and Principe">🇸🇹 Sao Tome and Principe</SelectItem>
<SelectItem value="Saudi Arabia">🇸🇦 Saudi Arabia</SelectItem>
<SelectItem value="Senegal">🇸🇳 Senegal</SelectItem>
<SelectItem value="Serbia">🇷🇸 Serbia</SelectItem>
<SelectItem value="Seychelles">🇸🇨 Seychelles</SelectItem>
<SelectItem value="Sierra Leone">🇸🇱 Sierra Leone</SelectItem>
<SelectItem value="Singapore">🇸🇬 Singapore</SelectItem>
<SelectItem value="Slovakia">🇸🇰 Slovakia</SelectItem>
<SelectItem value="Slovenia">🇸🇮 Slovenia</SelectItem>
<SelectItem value="Solomon Islands">🇸🇧 Solomon Islands</SelectItem>
<SelectItem value="Somalia">🇸🇴 Somalia</SelectItem>
<SelectItem value="South Africa">🇿🇦 South Africa</SelectItem>
<SelectItem value="South Sudan">🇸🇸 South Sudan</SelectItem>
<SelectItem value="Spain">🇪🇸 Spain</SelectItem>
<SelectItem value="Sri Lanka">🇱🇰 Sri Lanka</SelectItem>
<SelectItem value="Sudan">🇸🇩 Sudan</SelectItem>
<SelectItem value="Suriname">🇸🇷 Suriname</SelectItem>
<SelectItem value="Sweden">🇸🇪 Sweden</SelectItem>
<SelectItem value="Switzerland">🇨🇭 Switzerland</SelectItem>
<SelectItem value="Syria">🇸🇾 Syria</SelectItem>
<SelectItem value="Taiwan">🇹🇼 Taiwan</SelectItem>
<SelectItem value="Tajikistan">🇹🇯 Tajikistan</SelectItem>
<SelectItem value="Tanzania">🇹🇿 Tanzania</SelectItem>
<SelectItem value="Thailand">🇹🇭 Thailand</SelectItem>
<SelectItem value="Timor-Leste">🇹🇱 Timor-Leste</SelectItem>
<SelectItem value="Togo">🇹🇬 Togo</SelectItem>
<SelectItem value="Tonga">🇹🇴 Tonga</SelectItem>
<SelectItem value="Trinidad and Tobago">🇹🇹 Trinidad and Tobago</SelectItem>
<SelectItem value="Tunisia">🇹🇳 Tunisia</SelectItem>
<SelectItem value="Turkey">🇹🇷 Turkey</SelectItem>
<SelectItem value="Turkmenistan">🇹🇲 Turkmenistan</SelectItem>
<SelectItem value="Tuvalu">🇹🇻 Tuvalu</SelectItem>
<SelectItem value="Uganda">🇺🇬 Uganda</SelectItem>
<SelectItem value="Ukraine">🇺🇦 Ukraine</SelectItem>
<SelectItem value="United Arab Emirates">🇦🇪 United Arab Emirates</SelectItem>
<SelectItem value="United Kingdom">🇬🇧 United Kingdom</SelectItem>
<SelectItem value="United States">🇺🇸 United States</SelectItem>
<SelectItem value="Uruguay">🇺🇾 Uruguay</SelectItem>
<SelectItem value="Uzbekistan">🇺🇿 Uzbekistan</SelectItem>
<SelectItem value="Vanuatu">🇻🇺 Vanuatu</SelectItem>
<SelectItem value="Vatican City">🇻🇦 Vatican City</SelectItem>
<SelectItem value="Venezuela">🇻🇪 Venezuela</SelectItem>
<SelectItem value="Vietnam">🇻🇳 Vietnam</SelectItem>
<SelectItem value="Yemen">🇾🇪 Yemen</SelectItem>
<SelectItem value="Zambia">🇿🇲 Zambia</SelectItem>
<SelectItem value="Zimbabwe">🇿🇼 Zimbabwe</SelectItem>
                  </SelectContent>
                </Select>
                {errors.nationality && <p className="text-sm text-red-500 mt-1">{errors.nationality}</p>}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clubs">Clubs</Label>
                <Input
                  id="clubs"
                  name="clubs"
                  placeholder="Enter clubs"
                  className={`border-gray-200 ${errors.clubs ? "border-red-500" : ""}`}
                  value={formData.clubs}
                  onChange={onInputChange}
                  disabled={disabled}
                />
                {errors.clubs && <p className="text-sm text-red-500 mt-1">{errors.clubs}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lunch">Lunch Preference</Label>
                <Select
                  value={formData.lunch}
                  onValueChange={(value) => onSelectChange("lunch", value)}
                  disabled={disabled}
                >
                  <SelectTrigger id="lunch" className={errors.lunch ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select lunch preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
                {errors.lunch && <p className="text-sm text-red-500 mt-1">{errors.lunch}</p>}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="honorRolls" className="cursor-pointer">
                    Honor Rolls
                  </Label>
                  <Switch
                    id="honorRolls"
                    checked={formData.honorRolls}
                    onCheckedChange={(checked) => onSelectChange("honorRolls", checked)}
                    disabled={disabled}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="athletics" className="cursor-pointer">
                    Athletics
                  </Label>
                  <Switch
                    id="athletics"
                    checked={formData.athletics}
                    onCheckedChange={(checked) => onSelectChange("athletics", checked)}
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={onCancel} disabled={disabled}>
                Cancel
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800" onClick={onContinue} disabled={disabled}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

