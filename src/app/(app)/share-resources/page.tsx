'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ShareResources } from '@/schema/ShareResources'
import { useEffect, useState } from 'react'
import TagsInput from '@/components/CommonComponents/TagsInput'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CategoriesData from './Category.json';
import { FaFileUpload } from 'react-icons/fa'
import axios from 'axios';
import { AppDispatch, RootState } from '@/lib/store'
import { useDispatch, useSelector } from 'react-redux'



const ShareRecipe = () => {

  const {categoriesList, error, loading} = useSelector((state: RootState) => state.categoriesList);
  console.log(categoriesList)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [category, setCategory] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof ShareResources>>({
    resolver: zodResolver(ShareResources),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      category: '',
      subCategory: '',
      file: null  // Set to null to handle the initial state
    }
  })

  const { handleSubmit, control, reset, setValue } = form

  const [fileName, setFileName] = useState<string | null>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;  // Get the selected file or null
    setFileName(file?.name || '');  // Update the fileName state
    setValue('file', file);  // Update the form value
  };

  const onSubmit = async (data: z.infer<typeof ShareResources>) => {
    setIsSubmitting(true);
    console.log(data);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('tags', JSON.stringify(data.tags));
    formData.append('category', data.category);
    formData.append('subCategory', data.subCategory);

    if (data.file) {  // Ensure the file is present
      formData.append('file', data.file);  // Append the File object
    }

    try {
      const response = await axios.post("/api/resources-share", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response)

      toast({
        title: "Success!",
        description: response.data.message,
      });

      reset();
      setFileName(null);
    } catch (error: any) {
      if (error.response) {
        toast({
          title: "Error",
          description: error.response.data.message,
          duration: 5000,
        });
      }else{
        toast({
          title: "Error",
          description: "There was an error sharing your resource.",
          duration: 5000,
        })
      }
      
    } finally {
      setIsSubmitting(false);
    }
  }

  const subCategories = category ? CategoriesData.find(cat => cat.id === category)?.options : []

  return (
    <div className="flex justify-center items-center min-h-screen px-5 py-10 pt-[150px] bg-primary-100 dark:bg-gray-900">
      <div className="w-full md:w-2/3 lg:w-1/2 p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Share a Knowledgeable Material
          </h1>
          <p className="mb-4">Add your pdf to LearnShareMedia collection</p>
        </div>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resources Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title" {...field} />
                  </FormControl>
                  <FormMessage className='text-red-500' />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Please provide a brief, one-line description)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage className='text-red-500' />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add File (Only pdfs You can share)</FormLabel>
                  <FormControl>
                    <div>
                      <div className="relative">
                        <Input
                          type="file"
                          className="hidden"
                          id="file-upload"
                          onChange={handleFileChange}  // Handle file changes
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex items-center justify-center w-full h-12 px-4 py-2 border border-gray-900 rounded-md cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <FaFileUpload className="text-xl mr-2" />
                          <span className="text-sm font-medium text-gray-700">
                            {fileName || 'Choose file'}
                          </span>
                        </label>
                      </div>
                      {fileName && (
                        <p className="mt-2 text-sm text-gray-500">Selected file: {fileName}</p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className='text-red-500' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select onValueChange={(value) => { field.onChange(value); setCategory(value); }} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a Category" />
                      </SelectTrigger>
                      <SelectContent className='bg-white'>
                        <SelectGroup>
                          <SelectLabel>Category</SelectLabel>
                          {
                            CategoriesData.map((category) => (
                              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                            ))
                          }
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className='text-red-500' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Category</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a Sub Category" />
                      </SelectTrigger>
                      <SelectContent className='bg-white'>
                        <SelectGroup>
                          <SelectLabel>Sub Category</SelectLabel>
                          {
                            subCategories?.map((subCategory) => (
                              <SelectItem key={subCategory.value} value={subCategory.value}>{subCategory.label}</SelectItem>
                            ))
                          }
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className='text-red-500' />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagsInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage className='text-red-500' />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  Wait... <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Submit Resources'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default ShareRecipe
