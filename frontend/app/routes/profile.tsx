"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Separator } from "~/components/ui/separator"
import {
  UserIcon,
  Mail,
  Calendar,
  Edit,
  Save,
  GraduationCap,
  School,
  FileText
} from "lucide-react"
import Header from "~/components/Header/Header"
import { useAuth } from "~/contexts/AuthContext"
import { format, parseISO } from "date-fns"

interface Batch {
  _id: string;
  batchYear: string;
  college: string;
  degree: string;
}

interface ExtendedUser {
  _id: string;
  name: string;
  email: string;
  enrollmentNumber: string;
  batch: Batch;
  profilePicture?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const { user } = useAuth()
  
  const extendedUser = user as unknown as ExtendedUser

  const handleSaveProfile = () => {
    setIsEditing(false)
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="container py-6 md:py-10">
          <Card>
            <CardContent className="py-10 text-center">
              <p>Please log in to view your profile.</p>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  const getInitials = (name: string): string => {
    return name?.split(' ')
      .map(n => n[0])
      .join('') || 'U'
  }

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'PPP')
    } catch (e) {
      return dateString
    }
  }

  return (
    <>
      <Header />
      <main className="container max-w-6xl py-8 md:py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8">
          <div>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-b from-primary/20 to-background h-32"></div>
                <div className="px-6 pb-6 -mt-16 flex flex-col items-center">
                  <Avatar className="h-40 w-40 border-4 border-background">
                    <AvatarImage src={extendedUser.profilePicture} alt={extendedUser.name} />
                    <AvatarFallback className="text-3xl">{getInitials(extendedUser.name)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold mt-4">{extendedUser.name}</h2>
                  <p className="text-md text-muted-foreground">
                    Class of {extendedUser.batch?.batchYear || 'N/A'}
                  </p>

                  <div className="flex items-center justify-center gap-2 mt-6 w-full">
                    <Button variant="outline" size="lg" className="w-full" onClick={() => setIsEditing(!isEditing)}>
                      {isEditing ? (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Save Profile
                        </>
                      ) : (
                        <>
                          <Edit className="mr-2 h-5 w-5" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className={`h-3 w-3 rounded-full ${extendedUser.isVerified ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <p className="font-medium">{extendedUser.isVerified ? 'Verified Account' : 'Verification Pending'}</p>
                </div>
                {!extendedUser.isVerified && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Your account is pending verification. We will update you once it is verified.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full">
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl">Personal Information</CardTitle>
                <CardDescription className="text-base">
                  Your personal details and academic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-6 pt-8">
                <section>
                  <h3 className="text-xl font-medium mb-4">Basic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-6 w-6 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                        <p className="text-lg">{extendedUser.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Mail className="h-6 w-6 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                        <p className="text-lg">{extendedUser.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <FileText className="h-6 w-6 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Enrollment Number</p>
                        <p className="text-lg">{extendedUser.enrollmentNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Calendar className="h-6 w-6 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                        <p className="text-lg">{formatDate(extendedUser.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-8" />

                <section>
                  <h3 className="text-xl font-medium mb-4">Batch Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-6 w-6 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Degree</p>
                        <p className="text-lg">{extendedUser.batch?.degree || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <School className="h-6 w-6 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Graduation Year</p>
                        <p className="text-lg">{extendedUser.batch?.batchYear || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}