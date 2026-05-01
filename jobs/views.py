from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from users.serializers import  UserSerializer
from .serializers import JobSerializer
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from django.core.paginator import Paginator
from rest_framework.views import APIView
from .models import Jobs
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

# for apllyuser
from .models import Applyjob
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import ApplyjobSerializer
from rest_framework import viewsets
from rest_framework.decorators import action
from django.utils.dateparse import parse_datetime


# Create your views here.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def home(request):
    user = request.user 
    data = {
        "message": f"welcome to jobhire, {user.username}",
        'user': UserSerializer(user).data
    }
    return Response(data,status=status.HTTP_200_OK)

class DashboardApiView(APIView):
    permission_classes = [IsAuthenticated]
   
    def get(self,request) -> Response:
        search_query = request.GET.get('search','')
        work_mode_query = request.GET.get('work-mode','')
        salary_query = request.GET.getlist('salary-range[]',[])
        location_query = request.GET.getlist('locations[]',[])
        role_query = request.GET.get('role','')
        experience_query = request.GET.get('experience','')
        time_range_query = request.GET.get('time-range',0)
        current_time = timezone.now()
        page_number = request.GET.get('page',None)    

        user = request.user
        jobs = Jobs.objects.all()

        # If employer, only show their own jobs on the dashboard
        if hasattr(user, "employerprofile"):
            jobs = jobs.filter(employer=user.employerprofile)

        filter_names = []

        if search_query:
            jobs = Jobs.objects.filter(
                Q(title__icontains=search_query) | 
                Q(location__icontains=search_query) | 
                Q(job_skills__icontains=search_query)
            ).distinct()
            filter_names.append(f'{search_query}')

        if work_mode_query:
            jobs = jobs.filter(work_mode=work_mode_query)
            filter_names.append(f'{work_mode_query}')
            print(work_mode_query)
    
        if salary_query:
            salary = Q()
            for salaries in salary_query:
                if salaries == '0-3':
                    salary |= Q(min_salary__gte=0,max_salary__lte=3)
                if salaries == '3-6':
                    salary |= Q(min_salary__gte=3,max_salary__lte=6)
                if salaries == '6-10':
                    salary |= Q(min_salary__gte=6,max_salary__lte=10)
                if salaries == '10-15':
                    salary |= Q(min_salary__gte=10,max_salary__lte=15)
                if salaries == '15-20':
                    salary |= Q(min_salary__gte=15,max_salary__lte=20)
                if salaries == '20+':
                    salary |= Q(min_salary__gte=20)
            
            if salary:
                jobs = jobs.filter(salary)
            filter_names.append(f'{", ".join(salary_query)}')
        
        if location_query:
            location_filter = Q()

            if 'all' not in location_filter:
                for loc in location_query:
                    location_filter |= Q(location__icontains=loc)
            jobs = jobs.filter(location_filter)
            filter_names.append(f'{", ".join(location_query)}')
        
        if role_query:
            jobs = jobs.filter(role__icontains=role_query)
            filter_names.append(f'{role_query}')

        if experience_query:
            experience = int(experience_query)
            if experience <= 1:
                jobs = jobs.filter(experience='0-1')
            elif experience <= 3:
                jobs = jobs.filter(experience='1-3')
            elif experience <= 5:
                jobs = jobs.filter(experience='3-5')
            elif experience <= 7:
                jobs = jobs.filter(experience='5-7')
            elif experience <= 10:
                jobs = jobs.filter(experience='7-10')
            else:
                jobs = jobs.filter(experience='10+')
            filter_names.append(f'{experience_query} years')
        
        if time_range_query:
            try:
                time_range_query = int(time_range_query)
                if time_range_query == 0:
                    time_limit = current_time - timedelta(hours=1)
                elif time_range_query == 1:
                    time_limit = current_time - timedelta(days=1)
                elif time_range_query == 3:
                    time_limit = current_time - timedelta(days=3)
                elif time_range_query == 7:
                    time_limit = current_time - timedelta(days=7) 
                elif time_range_query == 15:
                    time_limit = current_time - timedelta(days=15)
                elif time_range_query == 30:
                    time_limit = current_time - timedelta(days=30) 
                else:
                    time_limit = current_time
                
                print(f"timelimit: {time_limit}")
                jobs = jobs.filter(posted_time__gte=time_limit)
            except ValueError:
                pass
            filter_names.append(f'{time_range_query} days')

        if not page_number:
            serializer = JobSerializer(jobs,many=True)
            return Response({
                'jobs':serializer.data,
            })
        else:
            paginator = Paginator(jobs,5)
            page_data = paginator.get_page(page_number)
            start_index = page_data.start_index()
            end_index = page_data.end_index()
            total_jobs = paginator.count

            serializer = JobSerializer(page_data,many=True)
            
            return Response({
                'jobs':serializer.data,
                'start_index':start_index,
                'end_index':end_index,
                'page_number':page_number,
                'total_jobs':total_jobs,
                'filter_names':filter_names
            })

class CreateJobView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        # Make sure user has employer profile
        if not hasattr(user,'employerprofile'):
            return Response({'detail':'only employers can create job'},status=status.HTTP_403_FORBIDDEN)

        # copy data from request
        data = request.data.copy()
        data['employer'] = user.employerprofile.id

        # pass request context to serializer
        serializer = JobSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            job = serializer.save()
            return Response(JobSerializer(job).data, status=status.HTTP_201_CREATED)
        else:
            # print errors for debugging
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateJobView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        user = request.user
        if not hasattr(user, 'employerprofile'):
            return Response({'detail': 'Only employers can update jobs.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            job = Jobs.objects.get(pk=pk)
        except Jobs.DoesNotExist:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        if job.employer.user != user:
            return Response({'detail': 'You are not allowed to update this job.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = JobSerializer(job, data=request.data)
        if serializer.is_valid():
            updated_job = serializer.save(employer=user.employerprofile)
            return Response(JobSerializer(updated_job).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteJobView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        job = get_object_or_404(Jobs, pk=pk)

        # Allow deletion for authenticated employers
        if not hasattr(request.user, "employerprofile"):
            return Response(
                {'error': 'Only employers can delete jobs.'},
                status=status.HTTP_403_FORBIDDEN
            )

        job.delete()
        return Response({'message': 'Job successfully deleted.'}, status=status.HTTP_200_OK)
    





class ApplyJobView(APIView):
    parser_classes = [MultiPartParser, FormParser]  # for file upload

    def post(self, request):
        data = request.data.copy()
        job_id = data.get("job") or data.get("job_id")

        if not job_id:
            return Response(
                {"errors": {"job": ["Job ID is required."]},
                 "message": "❌ Error applying for job"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            job = Jobs.objects.get(pk=job_id)
        except Jobs.DoesNotExist:
            return Response(
                {"errors": {"job": ["Job not found."]},
                 "message": "❌ Error applying for job"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Block applications for non-open jobs
        if job.status != "open":
            return Response(
                {
                    "errors": {
                        "job": [
                            "This job is not accepting applications (status is closed)."
                        ]
                    },
                    "message": "❌ This job is closed for applications",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data["job"] = job.id

        # If an authenticated applicant is applying, force email to their account email
        if request.user.is_authenticated and hasattr(request.user, "applicantprofile"):
            data["email"] = request.user.email

        serializer = ApplyjobSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "✅ Job applied successfully"},
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            {"errors": serializer.errors, "message": "❌ Error applying for job"},
            status=status.HTTP_400_BAD_REQUEST
        )





from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Applyjob
from .serializers import ApplyjobSerializer

class ApplyjobListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # If employer, get applications for their jobs
        if hasattr(user, "employerprofile"):
            applications = Applyjob.objects.filter(job__employer=user.employerprofile)
        else:  # applicant sees only their own applications
            applications = Applyjob.objects.filter(email=user.email)

        serializer = ApplyjobSerializer(applications, many=True)
        return Response(serializer.data)


class ApplyjobStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        Update the status (and optional interview_date) for a job application.
        Employers can only update applications for their own jobs.
        """
        user = request.user

        # Only employers are allowed to update application status
        if not hasattr(user, "employerprofile"):
            return Response(
                {"detail": "Only employers can update application status."},
                status=status.HTTP_403_FORBIDDEN,
            )

        application = get_object_or_404(Applyjob, pk=pk)

        # Ensure the application belongs to one of the employer's jobs
        if not application.job or application.job.employer != user.employerprofile:
            return Response(
                {"detail": "You do not have permission to modify this application."},
                status=status.HTTP_403_FORBIDDEN,
            )

        new_status = request.data.get("status")
        interview_date_str = request.data.get("interview_date")
        status_message = request.data.get("status_message") or request.data.get("message")

        # Validate status
        valid_statuses = {choice[0] for choice in Applyjob.STATUS_CHOICES}
        if new_status not in valid_statuses:
            return Response(
                {"detail": "Invalid status value."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        application.status = new_status
        application.status_message = status_message

        # Optional interview date parsing
        if interview_date_str:
            parsed_date = parse_datetime(interview_date_str)
            if not parsed_date:
                return Response(
                    {"detail": "Invalid interview_date format. Use ISO 8601."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            application.interview_date = parsed_date
        else:
            application.interview_date = None

        application.save()

        return Response(ApplyjobSerializer(application).data, status=status.HTTP_200_OK)


class ApplyjobDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        """
        Allow an employer to delete an application for one of their jobs.
        """
        user = request.user

        if not hasattr(user, "employerprofile"):
            return Response(
                {"detail": "Only employers can delete applications."},
                status=status.HTTP_403_FORBIDDEN,
            )

        application = get_object_or_404(Applyjob, pk=pk)

        if not application.job or application.job.employer != user.employerprofile:
            return Response(
                {"detail": "You do not have permission to delete this application."},
                status=status.HTTP_403_FORBIDDEN,
            )

        application.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)