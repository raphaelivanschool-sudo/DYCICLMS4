import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { GraduationCap, UserPlus } from 'lucide-react';
import SubjectManager from './SubjectManager';
import GradeSheet from './GradeSheet';
import StudentEnrollment from './StudentEnrollment';
import { getUser } from '../../utils/auth';

export default function GradingPanel() {
  const user = getUser();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <div className="p-8 max-w-7xl mx-auto">

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <GraduationCap size={22} className="text-blue-600" />
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Grading
          </h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-9">
          Manage subjects and enter student grades
        </p>
      </div>

      <Tabs defaultValue="subjects">
        <TabsList className="inline-flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl mb-8">
          <TabsTrigger value="subjects"
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all
                       text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300
                       data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-700
                       data-[state=active]:text-zinc-900 data-[state=active]:dark:text-zinc-100
                       data-[state=active]:shadow-sm">
            Subjects
          </TabsTrigger>
          <TabsTrigger value="grades"
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all
                       text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300
                       data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-700
                       data-[state=active]:text-zinc-900 data-[state=active]:dark:text-zinc-100
                       data-[state=active]:shadow-sm">
            Grade Entry
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="enrollment"
              className="px-5 py-2 rounded-xl text-sm font-medium transition-all
                         text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300
                         data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-700
                         data-[state=active]:text-zinc-900 data-[state=active]:dark:text-zinc-100
                         data-[state=active]:shadow-sm">
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Enrollment
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="subjects" className="min-h-[400px]">
          <SubjectManager />
        </TabsContent>
        <TabsContent value="grades" className="min-h-[400px]">
          <GradeSheet />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="enrollment" className="min-h-[400px]">
            <StudentEnrollment />
          </TabsContent>
        )}
      </Tabs>

    </div>
  );
}
