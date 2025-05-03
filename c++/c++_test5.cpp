#include <iostream>
#include <cstdlib> 
using namespace std;

class Caaa
{
	public:
		int a;
		int b;
		int c;
};
int main(void){
	Caaa obj;
	obj.a = 1;
	obj.b = 3;
	obj.c = obj.a + obj.b;
	cout << obj.a << endl;
	cout << obj.b << endl;
	cout << obj.c << endl;
	
	system("pause");
	return 0;
}
