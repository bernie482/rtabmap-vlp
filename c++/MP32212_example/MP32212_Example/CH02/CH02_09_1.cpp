#include <iostream>
using namespace std;
#define ARRAY_SIZE 5  //�x�}�����Ƥj�p 
int getValue(int ,int);
int A[ARRAY_SIZE][ARRAY_SIZE]={ //�W�T���x�}�����e 
       {1, 2, 0, 0, 0}, 
       {3, 4, 5, 0, 0}, 
       {0, 6, 7, 8, 0}, 
       {0, 0, 9, 10, 11}, 
       {0, 0, 0, 12, 13}};  
//�@���}�C���}�C�ŧi 
int B[ARRAY_SIZE*(1+ARRAY_SIZE)/2];
int k = 1;   
int main()
{
    int i=0,j=0;
    int index;    
		cout<<"=========================================="<<endl;
		cout<<"�a���x�}�G"<<endl;
		for ( i = 0 ; i < ARRAY_SIZE ; i++ ) 
		{
			for ( j = 0 ; j < ARRAY_SIZE ; j++ ) 
		        cout<<"\t"<<A[i][j];
		    cout<<endl;    
		}
		//�N�k�W�T���x�}���Y���@���}�C 
		index=1;
		for ( i = 0 ; i < ARRAY_SIZE ; i++ ) 
		{
			for ( j = 0 ; j < ARRAY_SIZE ; j++ ) 
			{
                if(A[i][j]!=0) B[index++]=A[i][j];
            }
        }
		cout<<"=========================================="<<endl;
		cout<<"�H�@�����覡��ܡG"<<endl;
		cout<<"\t[";
		for ( i = 0 ; i < ARRAY_SIZE ; i++ ) 
		{
			for ( j = 0 ; j < ARRAY_SIZE ; j++ ){ 
                if(abs(i-j) <= k)
		        cout<<" "<<getValue(i,j);
            }
		}
		cout<<" ]";
		cout<<endl;    
}
int getValue(int i, int j) {
        int index = (2*k+1)*i + (j - i + k);
        return B[index];
}
