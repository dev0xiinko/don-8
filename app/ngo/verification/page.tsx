"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Building, 
  MapPin, 
  FileText, 
  Upload, 
  Phone, 
  Globe, 
  Users, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Send
} from "lucide-react"
import Link from "next/link"

interface VerificationData {
  organizationName: string
  description: string
  category: string
  website: string
  contactPerson: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  registrationNumber: string
  taxId: string
  bankAccount: string
  documents: {
    registration: File | null
    taxExempt: File | null
    financialReport: File | null
    boardResolution: File | null
  }
  socialMedia: {
    facebook: string
    twitter: string
    linkedin: string
  }
}

export default function NGOVerificationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [userData, setUserData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [verificationData, setVerificationData] = useState<VerificationData>({
    organizationName: "",
    description: "",
    category: "",
    website: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Philippines",
    registrationNumber: "",
    taxId: "",
    bankAccount: "",
    documents: {
      registration: null,
      taxExempt: null,
      financialReport: null,
      boardResolution: null
    },
    socialMedia: {
      facebook: "",
      twitter: "",
      linkedin: ""
    }
  })

  useEffect(() => {
    const socialLogin = document.cookie.includes('social_login=true')
    if (!socialLogin) {
      router.push('/register?type=ngo')
      return
    }

    const userDataCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_data='))
    
    if (userDataCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]))
        setUserData(userData)
        setVerificationData(prev => ({
          ...prev,
          email: userData.email,
          contactPerson: userData.name
        }))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setVerificationData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof VerificationData] as any),
          [child]: value
        }
      }))
    } else {
      setVerificationData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleFileUpload = (documentType: string, file: File | null) => {
    setVerificationData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }))
  }

  const calculateProgress = () => {
    const totalFields = 15
    let filledFields = 0
    
    if (verificationData.organizationName) filledFields++
    if (verificationData.description) filledFields++
    if (verificationData.category) filledFields++
    if (verificationData.contactPerson) filledFields++
    if (verificationData.phone) filledFields++
    if (verificationData.address) filledFields++
    if (verificationData.city) filledFields++
    if (verificationData.registrationNumber) filledFields++
    if (verificationData.taxId) filledFields++
    if (verificationData.documents.registration) filledFields++
    if (verificationData.documents.taxExempt) filledFields++
    if (verificationData.documents.financialReport) filledFields++
    
    return Math.round((filledFields / totalFields) * 100)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      document.cookie = `verification_submitted=true; path=/; max-age=86400`
      router.push('/ngo/verification/pending')
    } catch (error) {
      console.error('Verification submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return verificationData.organizationName && verificationData.description && verificationData.category
      case 2:
        return verificationData.contactPerson && verificationData.phone && verificationData.address && verificationData.city
      case 3:
        return verificationData.registrationNumber && verificationData.taxId
      case 4:
        return verificationData.documents.registration && verificationData.documents.taxExempt
      default:
        return false
    }
  }

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Organization Information</h3>
            <p className="text-gray-600 dark:text-gray-400">Tell us about your organization and its mission</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="organizationName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Organization Name *
              </Label>
              <Input
                id="organizationName"
                value={verificationData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                placeholder="Your Organization Name"
                className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Organization Description *
              </Label>
              <Textarea
                id="description"
                value={verificationData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your organization's mission, activities, and impact in the community..."
                rows={5}
                className="text-base border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-200 resize-none"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Category *
              </Label>
              <Select onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl">
                  <SelectValue placeholder="Select your organization's primary focus area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">Education & Learning</SelectItem>
                  <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
                  <SelectItem value="environment">Environment & Conservation</SelectItem>
                  <SelectItem value="poverty">Poverty Alleviation</SelectItem>
                  <SelectItem value="disaster">Disaster Relief & Emergency</SelectItem>
                  <SelectItem value="human-rights">Human Rights & Advocacy</SelectItem>
                  <SelectItem value="child-welfare">Child Welfare & Protection</SelectItem>
                  <SelectItem value="elderly-care">Elderly Care & Support</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Website <span className="text-gray-500 font-normal">(Optional)</span>
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="website"
                  value={verificationData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourorganization.org"
                  className="h-12 pl-11 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    if (currentStep === 2) {
      return (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contact & Address Information</h3>
            <p className="text-gray-600 dark:text-gray-400">How can we reach you and where are you located?</p>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactPerson" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Contact Person *
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="contactPerson"
                    value={verificationData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    placeholder="Full Name"
                    className="h-12 pl-11 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Phone Number *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    value={verificationData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+63 XXX XXX XXXX"
                    className="h-12 pl-11 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-200"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                value={verificationData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@organization.org"
                className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800"
                disabled
              />
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Email verified from social login
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Street Address *
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="address"
                  value={verificationData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street address"
                  className="h-12 pl-11 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-200"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  City *
                </Label>
                <Input
                  id="city"
                  value={verificationData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                  className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-200"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  State/Province *
                </Label>
                <Input
                  id="state"
                  value={verificationData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State/Province"
                  className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-200"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  ZIP Code *
                </Label>
                <Input
                  id="zipCode"
                  value={verificationData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="ZIP Code"
                  className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-200"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Country *
              </Label>
              <Select onValueChange={(value) => handleInputChange('country', value)} defaultValue="Philippines">
                <SelectTrigger className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Philippines">Philippines</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )
    }
    
    if (currentStep === 3) {
      return (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Legal Information</h3>
            <p className="text-gray-600 dark:text-gray-400">Legal registration details and social media presence</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="registrationNumber" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Registration Number *
              </Label>
              <Input
                id="registrationNumber"
                value={verificationData.registrationNumber}
                onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                placeholder="Organization registration number"
                className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taxId" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tax ID / TIN *
              </Label>
              <Input
                id="taxId"
                value={verificationData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="Tax Identification Number"
                className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankAccount" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Bank Account <span className="text-gray-500 font-normal">(Optional)</span>
              </Label>
              <Input
                id="bankAccount"
                value={verificationData.bankAccount}
                onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                placeholder="Bank account number for donations"
                className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-200"
              />
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-blue-200 dark:border-slate-600">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Social Media Presence <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook Page</Label>
                  <Input
                    value={verificationData.socialMedia.facebook}
                    onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                    placeholder="https://facebook.com/yourorganization"
                    className="h-11 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter Profile</Label>
                  <Input
                    value={verificationData.socialMedia.twitter}
                    onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                    placeholder="https://twitter.com/yourorganization"
                    className="h-11 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn Page</Label>
                  <Input
                    value={verificationData.socialMedia.linkedin}
                    onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/yourorganization"
                    className="h-11 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    if (currentStep === 4) {
      return (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4 shadow-lg">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Document Upload</h3>
            <p className="text-gray-600 dark:text-gray-400">Upload required documents for verification</p>
          </div>
          
          <div className="space-y-6">
            {[
              { key: 'registration', label: 'Organization Registration Certificate', required: true, description: 'Official registration document from government' },
              { key: 'taxExempt', label: 'Tax Exemption Certificate', required: true, description: 'Tax-exempt status certification' },
              { key: 'financialReport', label: 'Latest Financial Report', required: false, description: 'Annual financial statement or audit report' },
              { key: 'boardResolution', label: 'Board Resolution', required: false, description: 'Board resolution for NGO activities' }
            ].map((doc) => (
              <div key={doc.key} className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-6 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Label className="text-base font-semibold text-gray-900 dark:text-white">
                        {doc.label}
                      </Label>
                      {doc.required && (
                        <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>
                  </div>
                  {verificationData.documents[doc.key as keyof typeof verificationData.documents] && (
                    <div className="flex items-center text-emerald-600 dark:text-emerald-400 ml-4">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(doc.key, e.target.files?.[0] || null)}
                    className="h-12 text-base border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900 dark:file:text-emerald-300"
                  />
                  {verificationData.documents[doc.key as keyof typeof verificationData.documents] && (
                    <div className="flex items-center text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="font-medium">
                        {verificationData.documents[doc.key as keyof typeof verificationData.documents]?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Document Requirements</h4>
                <ul className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Files must be in PDF, DOC, DOCX, JPG, or PNG format
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Maximum file size: 10MB per document
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Documents must be clear and legible
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                    All required documents must be uploaded to proceed
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    return null
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Loading verification form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
      
      <div className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <Link href="/register?type=ngo" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 mb-8 group transition-all duration-200">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Registration
            </Link>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                NGO Verification
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Complete your organization verification to access your dashboard and start making a difference
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      Verification Progress
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.round(calculateProgress())}% complete
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Step {currentStep} of 4
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
                <div 
                  className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 -translate-y-1/2 transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                ></div>
                
                <div className="relative flex justify-between">
                  {[
                    { step: 1, title: 'Organization', icon: Building, color: 'emerald' },
                    { step: 2, title: 'Contact', icon: Users, color: 'blue' },
                    { step: 3, title: 'Legal', icon: FileText, color: 'purple' },
                    { step: 4, title: 'Documents', icon: Upload, color: 'orange' }
                  ].map(({ step, title, icon: Icon, color }) => {
                    const isActive = step === currentStep
                    const isCompleted = step < currentStep
                    const colorClasses = {
                      emerald: isActive ? 'from-emerald-500 to-blue-600' : isCompleted ? 'from-emerald-400 to-emerald-500' : 'from-gray-300 to-gray-400',
                      blue: isActive ? 'from-blue-500 to-purple-600' : isCompleted ? 'from-blue-400 to-blue-500' : 'from-gray-300 to-gray-400',
                      purple: isActive ? 'from-purple-500 to-pink-600' : isCompleted ? 'from-purple-400 to-purple-500' : 'from-gray-300 to-gray-400',
                      orange: isActive ? 'from-orange-500 to-red-600' : isCompleted ? 'from-orange-400 to-orange-500' : 'from-gray-300 to-gray-400'
                    }
                    
                    return (
                      <div key={step} className="flex flex-col items-center group">
                        <div className={`
                          relative w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} 
                          shadow-lg flex items-center justify-center transition-all duration-300 
                          ${isActive ? 'scale-110 shadow-xl' : ''} 
                          ${isCompleted ? 'shadow-md' : ''}
                          group-hover:scale-105
                        `}>
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <Icon className="w-6 h-6 text-white" />
                          )}
                          {isActive && (
                            <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl opacity-30 animate-pulse"></div>
                          )}
                        </div>
                        <div className="mt-3 text-center">
                          <div className={`text-sm font-semibold transition-colors duration-200 ${
                            isActive ? 'text-gray-900 dark:text-white' : 
                            isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 
                            'text-gray-500 dark:text-gray-400'
                          }`}>
                            {title}
                          </div>
                          <div className={`text-xs mt-1 transition-colors duration-200 ${
                            isActive ? 'text-emerald-600 dark:text-emerald-400' : 
                            isCompleted ? 'text-emerald-500 dark:text-emerald-400' : 
                            'text-gray-400 dark:text-gray-500'
                          }`}>
                            {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-slate-800/50 pointer-events-none"></div>
              <CardContent className="relative p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {renderStepContent()}
                  
                  <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                      disabled={currentStep === 1}
                      className="h-12 px-8 text-base font-medium border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center space-x-2"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Previous</span>
                    </Button>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Step {currentStep} of 4
                      </span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              step === currentStep
                                ? 'bg-emerald-500 w-6'
                                : step < currentStep
                                ? 'bg-emerald-400'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {currentStep < 4 ? (
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                        className="h-12 px-8 text-base font-medium bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-12 px-8 text-base font-medium bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Application</span>
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}